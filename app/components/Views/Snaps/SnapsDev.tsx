import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { SnapElement } from './SnapElement';
import Button, {
  ButtonVariants,
  ButtonSize,
} from '../../../component-library/components/Buttons/Button';
import { useTheme } from '../../../util/theme';
import { getClosableNavigationOptions } from '../../UI/Navbar';
import { SnapsExecutionWebView } from '../../UI/SnapsExecutionWebView';
import Engine from '../../../core/Engine';

import { createStyles } from './styles';

/**
 * To test
 *
 * local:http://localhost:3000/snap/
 * local:http://localhost:3000/helloworldsnap/
 */

const SnapsDev = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [snapInput, setSnapInput] = useState<string>('');
  const snaps = useSelector(
    (state: any) => state.engine.backgroundState.SnapController.snaps,
  );

  const styles = createStyles(colors);

  useEffect(() => {
    navigation.setOptions(
      getClosableNavigationOptions('Snaps Dev', 'Close', navigation, colors),
    );
  }, [colors, navigation, snaps]);

  const installSuccessMsg = (id: string) => `Snap ${id} installed\n\n🎉🎉🎉`;
  const installFailedMsg = (id: string, e?: string) =>
    `Snap ${id} failed to install\n\n💀💀💀\n\n${e}`;

  const installSnap = async (snapId: string, origin: string): Promise<void> => {
    const { SnapController } = Engine.context as any;
    let message: string;
    try {
      const result = await SnapController.processRequestedSnap(
        origin,
        snapId,
        '',
      );
      if (result.error) {
        message = installFailedMsg(snapId, result.error);
      } else {
        message = installSuccessMsg(snapId);
        setSnapInput('');
      }
    } catch (e: any) {
      message = installFailedMsg(snapId, JSON.stringify(e));
    }
    Alert.alert('Snap Alert', message, [
      {
        text: 'Ok',
        onPress: () => null,
        style: 'cancel',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setSnapInput}
        value={snapInput}
        placeholder={'Snap to install'}
      />
      <Button
        label={'Install Snap'}
        onPress={() => installSnap(snapInput, 'metamask-mobile')}
        variant={ButtonVariants.Primary}
        size={ButtonSize.Sm}
        style={styles.installBtn}
      />
      <ScrollView style={styles.snapListContainer}>
        {Object.values(snaps).map((snap: any, idx: number) => (
          <SnapElement snap={snap} key={idx} />
        ))}
      </ScrollView>
      <View style={styles.webviewContainer}>
        <SnapsExecutionWebView />
      </View>
    </View>
  );
};

export default SnapsDev;
