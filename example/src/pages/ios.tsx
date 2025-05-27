import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  Text,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import * as AliyunPush from 'aliyun-react-native-push';
import { CustomButton, SectionCard } from '../components/CommonComponents';

const IOSPage: React.FC = () => {
  const [badge, setBadge] = useState('');
  const [apnsToken, setApnsToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetBadgeNum = async () => {
    if (!badge || isNaN(+badge)) {
      Alert.alert('错误', '请输入有效的角标数量');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AliyunPush.setIOSBadgeNum(+badge);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', `设置角标 ${badge} 成功`);
        setBadge('');
      } else {
        Alert.alert('错误', `设置角标 ${badge} 失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '设置角标失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncBadgeNum = async () => {
    if (!badge || isNaN(+badge)) {
      Alert.alert('错误', '请输入有效的角标数量');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AliyunPush.syncIOSBadgeNum(+badge);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', `同步角标 ${badge} 成功`);
        setBadge('');
      } else {
        Alert.alert('错误', `同步角标 ${badge} 失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '同步角标失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetApnsToken = async () => {
    try {
      const result = await AliyunPush.getApnsDeviceToken();
      setApnsToken(result || '无');
      Alert.alert('成功', `APNs Token: ${result || '无'}`);
    } catch (error) {
      Alert.alert('错误', '获取APNs Token失败: 未知错误');
    }
  };

  const handleCheckChannelOpened = async () => {
    try {
      const opened = await AliyunPush.isIOSChannelOpened();
      Alert.alert('通知通道状态', `通道${opened ? '已开启' : '未开启'}`);
    } catch (error) {
      Alert.alert('错误', '检查通知通道状态失败: 未知错误');
    }
  };

  const handleShowNotificationForeground = async () => {
    setIsLoading(true);
    try {
      const result = await AliyunPush.showNoticeWhenForeground(true);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', '设置前台显示通知成功');
      } else {
        Alert.alert('错误', `设置前台显示通知失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '设置前台显示通知失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoNotShowNotificationForeground = async () => {
    setIsLoading(true);
    try {
      const result = await AliyunPush.showNoticeWhenForeground(false);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', '设置前台不显示通知成功');
      } else {
        Alert.alert('错误', `设置前台不显示通知失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '设置前台不显示通知失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 角标管理 */}
        <Text style={styles.sectionHeader}>角标管理</Text>
        <SectionCard>
          <TextInput
            style={styles.input}
            onChangeText={setBadge}
            value={badge}
            placeholder="输入角标数量"
            keyboardType="numeric"
            placeholderTextColor="#666666"
          />
          <CustomButton
            title="设置App角标数量"
            onPress={handleSetBadgeNum}
            disabled={isLoading}
          />
          <CustomButton
            title="同步角标数量到阿里云服务器"
            onPress={handleSyncBadgeNum}
            disabled={isLoading}
          />
        </SectionCard>

        {/* APNs Token */}
        <Text style={styles.sectionHeader}>APNs Token</Text>
        <SectionCard>
          <CustomButton
            title="查询APNs Token"
            onPress={handleGetApnsToken}
            disabled={isLoading}
          />
          <Text style={styles.infoText}>APNs Token: {apnsToken || '无'}</Text>
        </SectionCard>

        {/* 通知设置 */}
        <Text style={styles.sectionHeader}>通知设置</Text>
        <SectionCard>
          <CustomButton
            title="检查阿里云在线通道状态"
            onPress={handleCheckChannelOpened}
            disabled={isLoading}
          />
          <CustomButton
            title="应用在前台时显示通知"
            onPress={handleShowNotificationForeground}
            disabled={isLoading}
          />
          <CustomButton
            title="应用在前台时不显示通知"
            onPress={handleDoNotShowNotificationForeground}
            disabled={isLoading}
          />
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginVertical: 12,
    marginLeft: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginVertical: 8,
    textAlign: 'center',
  },
});

export default IOSPage;
