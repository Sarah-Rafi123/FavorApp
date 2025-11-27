import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import useThemeStore from '../store/useThemeStore';
import { font_size, ThemeTypes } from '../constants';
import { BaseToastProps } from 'react-native-toast-message';

export const toastConfig = {
  success: ({ text1, text2 }: BaseToastProps) => {
    const theme = useThemeStore((state) => state.theme);
    const styles = createStyles(theme);

    return (
      <View style={[styles.container]}>
        <View style={{  borderRadius: 12, padding: 4, marginRight: 8, alignItems: "center", justifyContent: "center" }}>
          <Image source={require('../../assets/icon.png')} style={{ height: 40, width: 40, objectFit: 'contain' }} />
        </View>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[styles.title]} numberOfLines={1} ellipsizeMode="tail">{text1}</Text>
          <Text style={[styles.subtitle]} numberOfLines={3} ellipsizeMode="tail">{text2}</Text>
        </View>
      </View>
    );
  },
  error: ({ text1, text2 }: BaseToastProps) => {
    const theme = useThemeStore((state) => state.theme);
    const styles = createStyles(theme);

    return (
      <View style={[styles.container, { borderLeftWidth: 4, borderLeftColor: '#FF6B6B' }]}>
        <View style={{  borderRadius: 12, padding: 4, marginRight: 8, alignItems: "center", justifyContent: "center" }}>
          <Image source={require('../../assets/icon.png')} style={{ height: 40, width: 40, objectFit: 'contain' }} />
        </View>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[styles.title]} numberOfLines={1} ellipsizeMode="tail">{text1}</Text>
          <Text style={[styles.subtitle]} numberOfLines={3} ellipsizeMode="tail">{text2}</Text>
        </View>
      </View>
    );
  },
  info: ({ text1, text2 }: BaseToastProps) => {
    const theme = useThemeStore((state) => state.theme);
    const styles = createStyles(theme);

    return (
      <View style={[styles.container, { borderLeftWidth: 4, borderLeftColor: '#4A90E2' }]}>
        <View style={{  borderRadius: 12, padding: 4, marginRight: 8, alignItems: "center", justifyContent: "center" }}>
          <Image source={require('../../assets/icon.png')} style={{ height: 40, width: 40, objectFit: 'contain' }} />
        </View>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[styles.title]} numberOfLines={1} ellipsizeMode="tail">{text1}</Text>
          <Text style={[styles.subtitle]} numberOfLines={3} ellipsizeMode="tail">{text2}</Text>
        </View>
      </View>
    );
  },
  alert: ({ text1, text2 }: BaseToastProps) => {
    const theme = useThemeStore((state) => state.theme);
    const styles = createStyles(theme);

    return (
      <View style={[styles.container, { width: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }]}>
        <Text style={[styles.title]} numberOfLines={2} ellipsizeMode="tail">{text1}</Text>
        <Text style={[styles.subtitle, { textAlign: "center" }]} numberOfLines={3} ellipsizeMode="tail">{text2}</Text>
      </View>
    );
  }
};

const createStyles = (theme: ThemeTypes) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    width: '90%',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: font_size.M,

  },
  subtitle: {
    marginBottom: 4,
  }
});
