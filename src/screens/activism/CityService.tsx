
import firestore from '@react-native-firebase/firestore';
import { getPartOfList } from '../../backend/paginatedList';
import moment from 'moment';
const LimitNum = 10;

class CityService {
  private userInfo: any = null;
  getClips = async (cityId:string, onFinish: any) => {
    try {
      const _2daysago = Date.now() - (2 * 24 * 60 * 60 * 1000);
      const ref = firestore()
        .collection('Clips')
        .where('isHidden', '==', false)
        .where('cityId', '==', cityId)
        .where('date','>=',_2daysago)
        .orderBy('date', 'desc')
        .orderBy('activityCount', 'desc')
        .limit(10);
        console.log('ORF')
        console.log(ref)
      const res = await getPartOfList({ ref, limitNum: LimitNum });
      console.log('LOA')
        console.log(ref)
      const { list, lastDoc } = res;
      const clip_create_today = moment().startOf('today').format('D-M-y');
      const clip_create_yesterday = moment().subtract(1, 'day').format('D-M-y');



      let clips_today = [];
      let clips_yesterday = [];
      let newArray = [];

      for (var i = list.length - 1; i >= 0; i--) {

        if (moment(list[i].date).format('D-M-y') == clip_create_today) {
          clips_today.push(list[i]);
        } else {
          clips_yesterday.push(list[i]);
        }

      }

      let newlist = clips_today.concat(clips_yesterday);

      onFinish(newlist)
    } catch (error) {
      return onFinish([])
    }
  };


}

export default new CityService();