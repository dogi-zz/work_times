import {Injectable} from '@angular/core';
import {Month} from '../tools/date.tools';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';

const SHIFT_CODE_KEY = 'SHIFT_CODE';
const SHIFT_COMBINATIONS = 'SHIFT_COMBINATIONS';
const MONTH_ENTRY_CODE = 'MONTH_ENTRIES';
const JSON_BIN_DATA = 'JSON_BIN_DATA';

export type ShiftEntry = {
  shiftCode: string,
  fromTime: [number, number],
  toTime: [number, number],
}

const jsonBinMatch = window.location.search.match(/jsonBinIo=([^&]*)/);
let jsonBinData: {
  jsonBinIoBinId: string,
  jsonBinIoAccessKey: string,
}
if (jsonBinMatch) {
  console.info({jsonBinMatch})
  try {
    jsonBinData = JSON.parse(atob(jsonBinMatch[1]));
  } catch (e) {
    console.error(e)
  }
}

@Injectable({
  providedIn: "root"
})
export class DataService {

  private shiftEntries: ShiftEntry[];
  private shiftCombinations: string[];
  private allData: { [dayKey: string]: { day: number, shiftCode: string }[] };

  public jsonBinIoAccessKey = null;
  public jsonBinIoBinId = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {
    if (window.localStorage.getItem(SHIFT_CODE_KEY)) {
      this.shiftEntries = JSON.parse(window.localStorage.getItem(SHIFT_CODE_KEY));
    } else {
      this.shiftEntries = [];
    }
    if (window.localStorage.getItem(SHIFT_COMBINATIONS)) {
      this.shiftCombinations = JSON.parse(window.localStorage.getItem(SHIFT_COMBINATIONS));
    } else {
      this.shiftCombinations = [];
    }
    if (window.localStorage.getItem(MONTH_ENTRY_CODE)) {
      this.allData = JSON.parse(window.localStorage.getItem(MONTH_ENTRY_CODE));
    } else {
      this.allData = {};
    }

    if (jsonBinData) {
      window.localStorage.setItem(JSON_BIN_DATA, JSON.stringify(jsonBinData));
    }

    if (window.localStorage.getItem(JSON_BIN_DATA)) {
      jsonBinData = JSON.parse(window.localStorage.getItem(JSON_BIN_DATA));
      this.jsonBinIoAccessKey = jsonBinData.jsonBinIoAccessKey;
      this.jsonBinIoBinId = jsonBinData.jsonBinIoBinId;
    }

    this.route.queryParams.subscribe(params => {
      console.info(params)
    })
    //this.loadFromBin();
  }

  public get canUpload() {
    return !!this.jsonBinIoAccessKey && !!this.jsonBinIoBinId;
  }

  public loadFromBin() {
    if (this.jsonBinIoBinId && this.jsonBinIoAccessKey) {
      const headers = {
        'X-Access-Key': this.jsonBinIoAccessKey
      }
      this.http.get(`https://api.jsonbin.io/v3/b/${this.jsonBinIoBinId}`, {headers}).toPromise().then(data => {
        console.info(data)
      })
    }
  }

  public saveToBin() {
    const data = {
      shiftEntries: this.shiftEntries,
      shiftCombinations: this.shiftCombinations,
      allData: this.allData,
    }
    console.info(data)
    if (this.jsonBinIoBinId && this.jsonBinIoAccessKey) {
      const headers = {
        'Content-Type': 'application/json',
        'X-Access-Key': this.jsonBinIoAccessKey,
      }
      this.http.put(`https://api.jsonbin.io/v3/b/${this.jsonBinIoBinId}`, data, {headers}).toPromise().then(putResult => {
        console.info(putResult)
      })
    }
  }

  public getLocalShiftEntries(): ShiftEntry[] {
    return this.shiftEntries;
  }

  public getLocalShiftCombinations(): string[] {
    return this.shiftCombinations;
  }

  public saveShiftEntries(entries: ShiftEntry[]) {
    this.shiftEntries = entries;
    window.localStorage.setItem(SHIFT_CODE_KEY, JSON.stringify(entries));
  }

  public saveShiftCombinations(entries: string[]) {
    this.shiftCombinations = entries;
    window.localStorage.setItem(SHIFT_COMBINATIONS, JSON.stringify(entries));
  }

  public getLocalData(month: Month): { day: number, shiftCode: string }[] {
    const key = `${month.year}-${month.month}`;
    return this.allData[key] || [];
  }

  public saveLocalData(month: Month, data: { day: number, shiftCode: string }[]) {
    const key = `${month.year}-${month.month}`;
    this.allData[key] = data;
    window.localStorage.setItem(MONTH_ENTRY_CODE, JSON.stringify(this.allData));
  }

  exportLink() {
    const jsonBinData = {
      jsonBinIoBinId: this.jsonBinIoBinId,
      jsonBinIoAccessKey: this.jsonBinIoAccessKey,
    }
    window.history.replaceState(null, null, `?jsonBinIo=${btoa(JSON.stringify(jsonBinData))}`);
  }
}

