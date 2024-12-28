import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Tag = ({ label, isSelected, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tagContainer, isSelected && styles.selectedTag]}>
      <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>{label}</Text>
    </TouchableOpacity>
  );
};

const TagList = ({ tags, onSelectionChange }) => {
  const [selectedTag, setSelectedTag] = useState(null);

  const selectTag = (tag) => {
    setSelectedTag(tag);
    
    // Call the callback with the selected tag
    if (onSelectionChange) {
      onSelectionChange(tag);
    }
  };

  return (
    <View style={styles.tagListContainer}>
      {tags.map((tag, index) => (
        <Tag
          key={index}
          label={tag}
          isSelected={selectedTag === tag}
          onPress={() => selectTag(tag)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginRight: 8,
    marginBottom: 8,
  
  },
  selectedTag: {
    backgroundColor: 'green',
  },
  tagText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    
  },
  selectedTagText: {
    color: 'white', // Change text color for selected tag
  },
  tagListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    
  },
});

export default TagList;
