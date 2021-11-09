import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuietModeService {
  private static LOCAL_STORAGE_KEY = 'TimestreamNavigator_QuietMode';

  // region public observable: Observable<boolean>;
  private subject = new BehaviorSubject(false);
  public get observable() {
    return this.subject.asObservable();
  }
  // endregion
  //region public value: boolean;
  private _value = false;
  public get value() {
    return this._value;
  }
  public set value(v) {
    this._value = v;
    localStorage.setItem(QuietModeService.LOCAL_STORAGE_KEY, v ? 'true' : '');
    this.subject.next(v);
  }
  //endregion

  constructor() {
    this._value = !!localStorage.getItem(QuietModeService.LOCAL_STORAGE_KEY);
  }
}
