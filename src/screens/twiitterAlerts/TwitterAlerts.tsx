import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';

const TWITTER_BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAP9MyAEAAAAAYaXZXn8%2FWW66Kf00GXs39o5k48Q%3Dez1PNESuNlksKZnRlrKAYPZOv2tiPeCdZUQLcV6KzIn3XXaYri';
const TWITTER_USERNAME = 'TTCnotices'; // Toronto Transit Alerts

const TwitterAlerts = () => {
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTweets = async () => {
        try {
            const response = await fetch(
                `https://api.twitter.com/2/tweets/search/recent?query=from:${TWITTER_USERNAME}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();
            console.error('RESP tweets:', data);
            if (data.data) {
                setTweets(data.data);
            }
        } catch (error) {
            console.error('Error fetching tweets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTweets();
    }, []);

    return (
        <View>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={tweets}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        console.log(item)
                        return (
                            <Text>{item.text}</Text>
                        )
                    }}
                />
            )}
        </View>
    );
};

export default TwitterAlerts;
