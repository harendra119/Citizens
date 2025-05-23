import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Platform,
  Text,
  View,
} from 'react-native';
// import NativeAdView, {
//   AdvertiserView,
//   CallToActionView,
//   HeadlineView,
//   IconView,
//   StarRatingView,
//   StoreView,
//   TaglineView,
// } from 'react-native-admob-native-ads';
import {MediaView} from './MediaView';
import {Events, Logger} from './utils';

export const AdView = React.memo(({index, media, type, loadOnMount = true, onClose}) => {
  const [aspectRatio, setAspectRatio] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const nativeAdRef = useRef();

  const onAdFailedToLoad = event => {
    setError(true);
    setLoading(false);
    /**
     * Sometimes when you try to load an Ad, it will keep failing
     * and you will recieve this error: "The ad request was successful,
     * but no ad was returned due to lack of ad inventory."
     *
     * This error is not a bug or issue with our Library.
     * Just remove the app from your phone & clean your build
     * folders by running ./gradlew clean in /android folder
     * and for iOS clean the project in xcode. Hopefully the error will
     * be gone.
     *
     * [iOS] If you get this error: "Cannot find an ad network adapter with
     * the name(s): com.google.DummyAdapter". The ad inventory is empty in your
     * location. Try using a vpn to get ads in a different location.
     *
     * If you have recently created AdMob IDs for your ads, it might take
     * a few days until the ads will start showing.
     */
    Logger('AD', 'FAILED', event.error.message);
  };

  const onAdLoaded = () => {
    Logger('AD', 'LOADED', 'Ad has loaded successfully');
  };

  const onAdClicked = () => {
    Logger('AD', 'CLICK', 'User has clicked the Ad');
  };

  const onAdImpression = () => {
    Logger('AD', 'IMPRESSION', 'Ad impression recorded');
  };

  const onNativeAdLoaded = event => {
    Logger('AD', 'RECIEVED', 'Unified ad  Recieved', event);
    setLoading(false);
    setLoaded(true);
    setError(false);
    setAspectRatio(event.aspectRatio);
  };

  const onAdLeftApplication = () => {
    Logger('AD', 'LEFT', 'Ad left application');
  };

  const onViewableItemsChanged = useCallback(
    event => {
      /**
       * [STEP IV] We check if any AdViews are currently viewable.
       */
      let viewableAds = event.viewableItems.filter(
        i => i.key.indexOf('ad') !== -1,
      );

      viewableAds.forEach(adView => {
        if (adView.index === index && !loaded) {
          /**
           * [STEP V] If the ad is viewable and not loaded
           * already, we will load the ad.
           */
          setLoading(true);
          setLoaded(false);
          setError(false);
          Logger('AD', 'IN VIEW', 'Loading ' + index);
          nativeAdRef.current?.loadAd();
        } else {
          /**
           * We will not reload ads or load
           * ads that are not viewable currently
           * to save bandwidth and requests sent
           * to server.
           */
          if (loaded) {
            Logger('AD', 'IN VIEW', 'Loaded ' + index);
          } else {
            Logger('AD', 'NOT IN VIEW', index);
          }
        }
      });
    },
    [index, loaded],
  );

  useEffect(() => {
    /**
     * for previous steps go to List.js file.
     *
     * [STEP III] We will subscribe to onViewableItemsChanged event in all AdViews in the List.
     */
    let onViewableItemsChangedHandler;
    
    if (!loadOnMount) {
     onViewableItemsChangedHandler = DeviceEventEmitter.addListener(
        Events.onViewableItemsChanged,
        onViewableItemsChanged,
      );
    }

    return () => {
      if (!loadOnMount) {
        onViewableItemsChangedHandler.remove();
      }
    };
  }, [index, loadOnMount, loaded, onViewableItemsChanged]);

  useEffect(() => {
    nativeAdRef.current?.loadAd();
    if (loadOnMount || index <= 15) {
      setLoading(true);
      setLoaded(false);
      setError(false);
      nativeAdRef.current?.loadAd();
    }
    return () => {
      setLoaded(false);
    };
  }, [loadOnMount, index]);

  return (
    <>
    {/* <NativeAdView
      ref={nativeAdRef}
      onAdLoaded={onAdLoaded}
      onAdFailedToLoad={onAdFailedToLoad}
      onAdLeftApplication={onAdLeftApplication}
      onAdClicked={onAdClicked}
      onAdImpression={onAdImpression}
      onNativeAdLoaded={onNativeAdLoaded}
      refreshInterval={60000 * 2}
      muted={true}
      style={{
        width: '98%',
        alignSelf: 'center',
        backgroundColor: 'transparent',
      }}
      videoOptions={{
        customControlsRequested: true,
        muted: true
      }}
       adUnitID={'ca-app-pub-3670399461068695/6858494455'} // REPLACE WITH NATIVE_AD_VIDEO_ID for video ads.
      repository={type === 'image' ? 'imageAd' : 'videoAd'}
    >
      <View
        style={{
          width: '100%',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: !loading && !error && loaded ? 0 : 1,
            zIndex: !loading && !error && loaded ? 0 : 10,
          }}
        >
          {loading && <ActivityIndicator size={28} color="#a9a9a9" />}
          {error && <Text style={{color: '#a9a9a9'}}>:-(</Text>}
        </View>

        <View
          style={{
            height: 100,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingHorizontal: 10,
            opacity: loading || error || !loaded ? 0 : 1,
          }}
        >
          <IconView
            style={{
              width: 60,
              height: 60,
            }}
          />
          <View
            style={{
              flexGrow:1,
              flexShrink:1,
              paddingHorizontal: 6,
            }}
          >
            <HeadlineView
              hello="abc"
              style={{
                fontWeight: 'bold',
                fontSize: 13,
              }}
            />
            <TaglineView
              numberOfLines={2}
              style={{
                fontSize: 11,
              }}
            />
            <AdvertiserView
              style={{
                fontSize: 10,
                color: 'gray',
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <StoreView
                style={{
                  fontSize: 12,
                }}
              />
              <StarRatingView
                starSize={12}
                fullStarColor="orange"
                emptyStarColor="gray"
                style={{
                  width: 65,
                  marginLeft: 10,
                }}
              />
            </View>
          </View>

          <CallToActionView
            style={[
              {
                minHeight: 45,
                paddingHorizontal: 12,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 10,
                maxWidth: 100,
                width: 80,
              },
              Platform.OS === 'ios'
                ? {
                    backgroundColor: '#FFA500',
                    borderRadius: 10,
                  }
                : {},
            ]}
            buttonAndroidStyle={{
              backgroundColor: '#FFA500',
              borderRadius: 10,
            }}
            allCaps
            textStyle={{
              fontSize: 13,
              flexWrap: 'wrap',
              textAlign: 'center',
              color:'white'
            }}
          />
        </View>
        {media ? <MediaView aspectRatio={aspectRatio} /> : null}
      </View>
    </NativeAdView> */}
    
    </>
  );
});
