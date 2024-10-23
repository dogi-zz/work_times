import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {DataService, ShiftEntry} from './data-service';
import {splitShift} from '../tools/string-tools';
import {Month} from '../tools/date.tools';

const pad2 = (num: number) => num < 10 ? `0${num}` : `${num}`;

@Injectable({
  providedIn: "root"
})
export class ShiftCodeService {

  public allShifts = new BehaviorSubject<ShiftEntry[]>([])
  public allShiftCombinations = new BehaviorSubject<string[]>([]);


  constructor(
    private dataService: DataService,
  ) {
    console.info(this);
    this.allShifts.next(this.dataService.getLocalShiftEntries())
    this.allShiftCombinations.next(this.dataService.getLocalShiftCombinations());

    this.dataService.loadData.subscribe(()=>{
      this.allShifts.next(this.dataService.getLocalShiftEntries())
      this.allShiftCombinations.next(this.dataService.getLocalShiftCombinations());
    });
    this.checkShiftCombinations();
  }

  public getShiftString(shiftCode: string): Observable<string> {
    return this.allShifts.pipe(map(shifts => {
      const shift = shifts.find(s => s.shiftCode === shiftCode);
      if (shift) {
        return `${pad2(shift.fromTime[0])}:${pad2(shift.fromTime[1])}-${pad2(shift.toTime[0])}:${pad2(shift.toTime[1])}`;
      } else {
        return null;
      }
    }))
  }

  public getShiftStringSync(shiftCode: string): string {
    const shift = this.allShifts.value.find(s => s.shiftCode === shiftCode);
    if (shift) {
      return `${pad2(shift.fromTime[0])}:${pad2(shift.fromTime[1])}-${pad2(shift.toTime[0])}:${pad2(shift.toTime[1])}`;
    } else {
      return null;
    }
  }

  public getShiftTimes(shiftCode: string): {from: [number, number], to: [number, number]} {
    const shift = this.allShifts.value.find(s => s.shiftCode === shiftCode);
    if (shift) {
      return {from: shift.fromTime, to: shift.toTime };
    } else {
      return null;
    }
  }

  public hasShiftString(shiftCode: string): boolean {
    return !!this.allShifts.value.find(s => s.shiftCode === shiftCode)
  }

  public getShiftCodes(inputString: string): { shifts: string[], unknown: string[] } {
    if (inputString.trim().length === 0) {
      return {shifts: [], unknown: []};
    }
    const shifts: string[] = [];
    const unknown: string[] = [];
    const parts = splitShift(inputString);
    parts.forEach(shiftCode => {
      if (this.allShifts.value.find(s => s.shiftCode === shiftCode)) {
        shifts.push(shiftCode);
      } else {
        unknown.push(shiftCode);
      }
    });
    return {shifts, unknown};
  }

  addShiftTime(newShift: ShiftEntry) {
    this.allShifts.value.push(newShift)
    this.allShifts.next(this.allShifts.value);
    this.dataService.saveShiftEntries(this.allShifts.value)
  }

  public convertToShiftEntries(shiftCodes: string[][]): { min: number, max: number, times: [number, number] [][] } {
    let min: number = 8;
    let max: number = 20;
    const times: [number, number] [][] = [];
    shiftCodes.forEach((shiftCodeLine) => {
      const timeRow: [number, number] [] = [];
      shiftCodeLine.forEach(shiftCode => {
        const shiftEntry = this.allShifts.value.find(s => s.shiftCode === shiftCode);
        if (shiftEntry) {
          const fromTime = shiftEntry.fromTime[0] + shiftEntry.fromTime[1] / 60;
          const toTime = shiftEntry.toTime[0] + shiftEntry.toTime[1] / 60;
          min = Math.min(min, fromTime)
          max = Math.max(max, toTime)
          timeRow.push([fromTime, toTime])
        }
      })
      times.push(timeRow);
    })
    return {min, max, times}
  }

  addShiftCombination(shiftCode: string) {
    const parts = splitShift(shiftCode);
    if (parts.every(sc => this.allShifts.value.find(s => s.shiftCode === sc))) {
      const combination = parts.join(',')
      if (!this.allShiftCombinations.value.includes(combination)) {
        this.allShiftCombinations.next([...this.allShiftCombinations.value, combination]);
        this.dataService.saveShiftCombinations(this.allShiftCombinations.value)
      }
    }
  }

  private checkShiftCombinations() {
    this.allShiftCombinations.next(this.allShiftCombinations.value.filter(combination => {
      return splitShift(combination).every(sc => this.allShifts.value.find(s => s.shiftCode === sc))
    }))
  }

  deleteShift(shift: ShiftEntry) {
    this.allShifts.next(this.allShifts.value.filter(s => s !== shift))
    this.checkShiftCombinations();
    this.dataService.saveShiftEntries(this.allShifts.value)
    this.dataService.saveShiftCombinations(this.allShiftCombinations.value)
  }

  deleteShiftCombination(shiftCombination: string) {
    this.allShiftCombinations.next(this.allShiftCombinations.value.filter(s => s !== shiftCombination));
    this.dataService.saveShiftCombinations(this.allShiftCombinations.value)
  }

  getExportData( month: Month): { day: number, times: { from: [number, number], to: [number, number] }[] }[]{
    const monthData = this.dataService.getLocalData(month);
    return monthData.map(dayEntry => {
      const {shifts, unknown} = this.getShiftCodes(dayEntry.shiftCode)
      const shiftCodes = [...shifts, ...unknown];
      const times = shiftCodes.map(s => this.getShiftTimes(s));
      return {day: dayEntry.day, times}
    });
  }

}
