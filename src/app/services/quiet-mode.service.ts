import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuietModeService {
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
    this.subject.next(v);
  }
  //endregion
}
