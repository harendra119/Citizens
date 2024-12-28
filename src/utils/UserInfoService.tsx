
const ADMIN_EMAILS = ['j.micah@live.com', 'gimtharendra1196@gmail.com']

class UserInfoService {
  private userInfo: any = null;

  setUserInfo = (userInfo: any) => {
    this.userInfo = userInfo;
  }

  getUserInfo  = () => {
    return  this.userInfo;
  }

  isAdminLogin = () => {
    return  ADMIN_EMAILS.includes(this.userInfo?.email);
  }


}

export default new UserInfoService();