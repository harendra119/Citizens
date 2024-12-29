
const ADMIN_EMAILS = ['j.micah@live.com', 'gimtharendra1196@gmail.com']

class UserInfoService {
  private userInfo: any = null;

  setUserInfo = (userInfo: any) => {
    console.log('#####')
    console.log(userInfo)
    this.userInfo = userInfo;
  }

  getUserInfo  = () => {
    return  this.userInfo;
  }

  getUserId = () => {
    return this.userInfo?.userId
  }

  isAdminLogin = () => {
    return  ADMIN_EMAILS.includes(this.userInfo?.email);
  }


}

export default new UserInfoService();