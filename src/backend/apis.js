//apis call for fetching data from backend . Rest apis
import firestore from '@react-native-firebase/firestore';

export async function getUsers(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user',
    {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function getOtherUser(id) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/' + id,
    {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}
export async function getUsersforFilters(key, userId) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/search/' +
      userId +
      '/' +
      key,
    {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function getFriednRequest(userId) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/requests/' +
      userId,
    {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function getTagFirends(userId) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/tag/' +
      userId,
    {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function getFirends(userId) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/friends/' +
      userId,
    {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function getFollowers(userId) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/followers/' +
      userId,
    {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function getFollowing(userId) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/following/' +
      userId,
    {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function socialRegister(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/register',
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function sendFirendRequest(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/sendrequest',
    {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function unFirend(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/unfriend',
    {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function checkFriendSTatus(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/checkfriendstatus',
    {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function cancelFriendRequest(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/cancelrequest',
    {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function resPondRequest(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/respondrequest',
    {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function sendFollowRequest(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/follow',
    {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function unFollow(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/unfollow',
    {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function loginApi(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/authenticate',
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}
export async function updatePassword(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user',
    {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}
export async function socailLogin(payload) {
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/social',
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}
export async function updateUser(payload, token) {
  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'multipart/form-data');
  myHeaders.append('Authorization', 'Bearer ' + token);
  myHeaders.append(
    'Cookie',
    'connect.sid=s%3AZPEcbwpk3eRT0rvUSHybCt1fA_Y-maYT.Pa%2B%2Ft0uOqC78vFGk0va9NiT%2FiyOtm4LbqT5t%2F3FQ%2FDQ',
  );
  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user',
    {
      method: 'PUT',
      headers: myHeaders,
      body: payload,
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {
      return error;
    });
}

export async function addStpries(payload) {
  // return fetch('http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/story',
  //   {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'multipart/form-data' },
  //     body: payload,
  //   })
  //   .then(res => res.json())
  //   .then(res => {
  //     if (res.success) {
  //       return res
  //     }
  //     else {
  //       return res
  //     }
  //   }).catch((error) => {
  //     return error;

  //   })
  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(payload),
    keepalive: true,
  };

  return fetch(
    'http://ec2-99-79-41-150.ca-central-1.compute.amazonaws.com/user/story',
    requestOptions,
  )
    .then((res) => res.json())
    .then((res) => {
      //is ma succes or error nahi a raha

      if (res.success) {
        return res;
      } else {
        return res;
      }
    })
    .catch((error) => {});
}

export async function getStories(userId) {}
