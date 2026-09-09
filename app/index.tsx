import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PetFlowColors } from '@/constants/petflow';
import { getProfile } from '@/lib/profile-storage';

export default function Index() {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then((profile) => {
      setHref(profile.onboardingCompleted ? '/(tabs)' : '/onboarding');
    });
  }, []);

  if (!href) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PetFlowColors.primary} />
      </View>
    );
  }

  return <Redirect href={href} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PetFlowColors.background,
  },
});
