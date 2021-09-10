import { Injectable } from '@angular/core';
import {Organization, User} from 'spirit-link';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserInfoService {
  public me?: User;
  public activeOrg?: Organization;
}
