import {Injectable} from '@angular/core';

const SHIFT_CODE_KEY = 'SHIFT_CODE';
const SHIFT_COMBINATIONS = 'SHIFT_COMBINATIONS';

const pad2 = (num: number) => num < 10 ? `0${num}` : `${num}`;

export type ShiftEntry = {
  shiftCode: string,
  fromTime: [number, number],
  toTime: [number, number],
  shiftString: string,
}

Injectable()

export class ShiftCodeService {

  public allShifts: ShiftEntry[] = [];
  public allShiftCombinations: string[] = [];

  constructor() {
    console.info(this);
    if (window.localStorage.getItem(SHIFT_CODE_KEY)) {
      this.allShifts = JSON.parse(window.localStorage.getItem(SHIFT_CODE_KEY));
    }
    if (window.localStorage.getItem(SHIFT_COMBINATIONS)) {
      this.allShiftCombinations = JSON.parse(window.localStorage.getItem(SHIFT_COMBINATIONS));
    }
    this.allShifts.forEach(shift => {
      shift.shiftString = `${pad2(shift.fromTime[0])}:${pad2(shift.fromTime[1])}-${pad2(shift.toTime[0])}:${pad2(shift.toTime[1])}`;
    })
    this.checkShiftCombinations();
  }

  public getShiftCodes(inputString: string): ShiftEntry[] {
    if (inputString.trim().length === 0) {
      return [];
    }
    const parts = inputString.trim().toLowerCase().split(',');
    return parts.map(shiftCode => {
      return this.allShifts.find(s => s.shiftCode === shiftCode) || {
        shiftCode,
        fromTime: null,
        toTime: null,
        shiftString: null,
      }
    });
  }

  addShiftTime(newShift: ShiftEntry) {
    this.allShifts.push(newShift)
    window.localStorage.setItem(SHIFT_CODE_KEY, JSON.stringify(this.allShifts))
  }

  addShiftCombination(shiftCode: string) {
    if (shiftCode.split(',').every(sc => this.allShifts.find(s => s.shiftCode === sc))){
      if (!this.allShiftCombinations.includes(shiftCode)) {
        this.allShiftCombinations.push(shiftCode)
        window.localStorage.setItem(SHIFT_COMBINATIONS, JSON.stringify(this.allShiftCombinations))
      }
    }
  }

  private checkShiftCombinations(){
    this.allShiftCombinations = this.allShiftCombinations.filter(combination => {
      return combination.split(',').every(sc => this.allShifts.find(s => s.shiftCode === sc))
    });
  }

  deleteShift(shift: ShiftEntry) {
    this.allShifts = this.allShifts.filter(s => s !== shift);
    this.checkShiftCombinations();
    window.localStorage.setItem(SHIFT_CODE_KEY, JSON.stringify(this.allShifts))
  }

  deleteShiftCombination(shiftCombination: string) {
    this.allShiftCombinations = this.allShiftCombinations.filter(s => s !== shiftCombination);
    window.localStorage.setItem(SHIFT_COMBINATIONS, JSON.stringify(this.allShiftCombinations))
  }

}
