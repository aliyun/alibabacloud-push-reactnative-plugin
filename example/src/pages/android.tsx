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

const AndroidPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('');
  const [badgeNum, setBadgeNum] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initThirdPush = () => {
    AliyunPush.initAndroidThirdPush().then((result) => {
      console.log(result);
      let code = result.code;
      if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('注册Android厂商通道成功');
      } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`注册Android厂商通道失败, errorMsg: ${errorMsg}`);
      }
    });
  };

  const handleBindPhoneNumber = async () => {
    if (!phone) {
      Alert.alert('错误', '请输入要绑定的手机号码');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AliyunPush.bindPhoneNumber(phone);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', `手机号码 ${phone} 绑定成功 👋`);
        setPhone('');
      } else {
        Alert.alert('错误', `绑定手机号码失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '绑定手机号码失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbindPhoneNumber = async () => {
    setIsLoading(true);
    try {
      const result = await AliyunPush.unbindPhoneNumber();
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', '解绑手机号码成功 👋');
      } else {
        Alert.alert('错误', `解绑手机号码失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '解绑手机号码失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenNotificationInGroup = async () => {
    setIsLoading(true);
    try {
      const result = await AliyunPush.setNotificationInGroup(true);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', '开启通知分组展示成功 👋');
      } else {
        Alert.alert('错误', `开启通知分组展示失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '开启通知分组展示失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseNotificationInGroup = async () => {
    setIsLoading(true);
    try {
      const result = await AliyunPush.setNotificationInGroup(false);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', '关闭通知分组展示成功 👋');
      } else {
        Alert.alert('错误', `关闭通知分组展示失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '关闭通知分组展示失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await AliyunPush.clearAndroidNotifications();
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', '清除所有通知成功 👋');
      } else {
        Alert.alert('错误', `清除所有通知失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '清除所有通知失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChannel = async () => {
    if (!channel) {
      Alert.alert('错误', '请输入通知通道名称');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AliyunPush.createAndroidChannel({
        id: channel,
        name: '测试通道A',
        importance: 3,
        desc: '测试创建通知通道',
      });
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', `通知通道 ${channel} 创建成功 👋`);
        setChannel('');
      } else {
        Alert.alert('错误', `创建通知通道失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '创建通知通道失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckNotification = async () => {
    try {
      const result = await AliyunPush.isAndroidNotificationEnabled();
      Alert.alert('通知状态', `通知是否启用: ${result ? '是' : '否'}`);
    } catch (error) {
      Alert.alert('错误', '检查通知状态失败: 未知错误');
    }
  };

  const handleCheckNotificationChannel = async () => {
    if (!channel) {
      Alert.alert('错误', '请输入通知通道名称');
      return;
    }
    try {
      const result = await AliyunPush.isAndroidNotificationEnabled(channel);
      Alert.alert(
        '通道状态',
        `通道 ${channel} 是否启用: ${result ? '是' : '否'}`
      );
    } catch (error) {
      Alert.alert('错误', '检查通知通道状态失败: 未知错误');
    }
  };

  const handleJumpToNotificationSettings = () => {
    AliyunPush.jumpToAndroidNotificationSettings();
  };

  const handleSetBadgeNum = async () => {
    if (!badgeNum) {
      Alert.alert('错误', '请输入角标数字');
      return;
    }
    const num = parseInt(badgeNum, 10);
    if (isNaN(num) || num < 0) {
      Alert.alert('错误', '请输入有效的角标数字（大于等于0）');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AliyunPush.setAndroidBadgeNum(num);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', `设置Android角标数字为 ${num} 成功 👋`);
        setBadgeNum('');
      } else {
        Alert.alert('错误', `设置Android角标失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '设置Android角标失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 厂商通道 */}
        <Text style={styles.sectionHeader}>厂商通道</Text>
        <SectionCard>
          <CustomButton title="注册Android厂商通道" onPress={initThirdPush} />
        </SectionCard>

        {/* 手机号码管理 */}
        <Text style={styles.sectionHeader}>手机号码管理</Text>
        <SectionCard>
          <TextInput
            style={styles.input}
            onChangeText={setPhone}
            value={phone}
            placeholder="输入手机号码"
            keyboardType="numeric"
            placeholderTextColor="#666666"
          />
          <CustomButton
            title="绑定手机号码"
            onPress={handleBindPhoneNumber}
            disabled={isLoading}
          />
          <CustomButton
            title="解绑手机号码"
            onPress={handleUnbindPhoneNumber}
            disabled={isLoading}
          />
        </SectionCard>

        {/* 通知管理 */}
        <Text style={styles.sectionHeader}>通知管理</Text>
        <SectionCard>
          <CustomButton
            title="开启通知分组展示"
            onPress={handleOpenNotificationInGroup}
            disabled={isLoading}
          />
          <CustomButton
            title="关闭通知分组展示"
            onPress={handleCloseNotificationInGroup}
            disabled={isLoading}
          />
          <CustomButton
            title="清除所有通知"
            onPress={handleClearAllNotifications}
            disabled={isLoading}
          />
        </SectionCard>

        {/* 角标管理 */}
        <Text style={styles.sectionHeader}>角标管理</Text>
        <SectionCard>
          <TextInput
            style={styles.input}
            onChangeText={setBadgeNum}
            value={badgeNum}
            placeholder="输入角标数字（如：5）"
            keyboardType="numeric"
            placeholderTextColor="#666666"
          />
          <CustomButton
            title="设置Android角标"
            onPress={handleSetBadgeNum}
            disabled={isLoading}
          />
        </SectionCard>

        {/* 通知通道管理 */}
        <Text style={styles.sectionHeader}>通知通道管理</Text>
        <SectionCard>
          <TextInput
            style={styles.input}
            onChangeText={setChannel}
            value={channel}
            placeholder="输入通知通道名称"
            placeholderTextColor="#666666"
          />
          <CustomButton
            title="创建通知通道"
            onPress={handleCreateChannel}
            disabled={isLoading}
          />
          <CustomButton
            title="检查通知状态"
            onPress={handleCheckNotification}
            disabled={isLoading}
          />
          <CustomButton
            title="检查通知通道状态"
            onPress={handleCheckNotificationChannel}
            disabled={isLoading}
          />
          <CustomButton
            title="跳转通知通道设置"
            onPress={handleJumpToNotificationSettings}
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
});

export default AndroidPage;
