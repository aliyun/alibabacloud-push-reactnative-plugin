import React, { useState, useEffect } from 'react';
import {
  Platform,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { default as Clipboard } from '@react-native-clipboard/clipboard';
import { CustomButton, SectionCard } from '../components/CommonComponents';
import * as AliyunPush from 'aliyun-react-native-push';
import { AliyunPushLogLevel } from 'aliyun-react-native-push';
import DeviceInfo from 'react-native-device-info';

// 配置App Key和App Secret（请在 https://emas.console.aliyun.com 获取）
const pushConfig = Platform.select({
  ios: {
    appKey: '335545908',
    appSecret: 'f9aada891c32423187b18ae319700c09',
  },
  android: {
    appKey: '335545921',
    appSecret: '4a941e67a6ab4109a673569b95e3348a',
  },
});

interface LogLevelItem {
  id: string;
  label: string;
  value: AliyunPushLogLevel;
}

interface CallbackEvent {
  id: number;
  time: string;
  name: string;
  content: string;
}

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [inited, setInited] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogLevel, setSelectedLogLevel] = useState<string | undefined>(
    undefined
  );
  const [isLogLevelModalVisible, setIsLogLevelModalVisible] = useState(false);
  const [callbackEvents, setCallbackEvents] = useState<CallbackEvent[]>([]);
  const maxEvents = 50;

  const logLevels: LogLevelItem[] = [
    { id: '1', label: 'None', value: AliyunPushLogLevel.None },
    { id: '2', label: 'Error', value: AliyunPushLogLevel.Error },
    { id: '3', label: 'Warn', value: AliyunPushLogLevel.Warn },
    { id: '4', label: 'Info', value: AliyunPushLogLevel.Info },
    { id: '5', label: 'Debug', value: AliyunPushLogLevel.Debug },
  ];

  const addCallbackEvent = (name: string, event: any) => {
    const time = new Date().toLocaleString();
    const content = JSON.stringify(event, null, 2);
    setCallbackEvents((prevEvents) => {
      const newEvent = {
        id: Date.now() + Math.floor(Math.random() * 100000),
        time,
        name,
        content,
      };
      const updatedEvents = [newEvent, ...prevEvents].slice(0, maxEvents);
      return updatedEvents;
    });
  };

  useEffect(() => {
    AliyunPush.addNotificationCallback((event) => {
      addCallbackEvent('onNotification', event);
    });

    AliyunPush.addNotificationReceivedInApp((event) => {
      addCallbackEvent('onNotificationReceivedInApp', event);
    });

    AliyunPush.addMessageCallback((event) => {
      addCallbackEvent('onMessageCallback', event);
    });

    AliyunPush.addNotificationOpenedCallback((event) => {
      addCallbackEvent('onNotificationOpen', event);
    });

    AliyunPush.addNotificationRemovedCallback((event) => {
      addCallbackEvent('onNotificationRemoved', event);
    });

    AliyunPush.addNotificationClickedWithNoAction((event) => {
      addCallbackEvent('onNotificationClickedWithNoAction', event);
    });

    AliyunPush.addChannelOpenCallback((event) => {
      addCallbackEvent('onChannelOpen', event);
    });

    AliyunPush.addRegisterDeviceTokenSuccessCallback((event) => {
      addCallbackEvent('onRegisterDeviceTokenSuccess', event);
    });

    AliyunPush.addRegisterDeviceTokenFailedCallback((event) => {
      addCallbackEvent('onRegisterDeviceTokenFailed', event);
    });

    if (Platform.OS === 'android') {
      AliyunPush.createAndroidChannel({
        id: '8.0up',
        name: '测试通道A',
        importance: 3,
        desc: '测试创建通知通道',
      }).then((result) => {
        console.log(result);
      });
    }

    return () => {
      AliyunPush.removePushCallback();
    };
  }, []);

  const handleSetLogLevel = async () => {
    if (!selectedLogLevel) {
      Alert.alert('错误', '请先选择一个日志级别');
      return;
    }
    const selectedLevel = logLevels.find(
      (item) => item.id === selectedLogLevel
    )?.value;
    try {
      if (selectedLevel) {
        AliyunPush.setLogLevel(selectedLevel);
      }
    } catch (error) {
      Alert.alert(
        '错误',
        `设置日志级别 ${selectedLevel} 失败: ${error || '未知错误'}`
      );
    }
  };

  const openLogLevelModal = () => {
    setIsLogLevelModalVisible(true);
  };

  const saveLogLevel = () => {
    setIsLogLevelModalVisible(false);
    handleSetLogLevel();
  };

  const cancelLogLevel = () => {
    setIsLogLevelModalVisible(false);
  };

  const initAliyunPush = () => {
    setIsLoading(true);
    AliyunPush.initPush(pushConfig?.appKey, pushConfig?.appSecret)
      .then((result) => {
        setIsLoading(false);
        let code = result.code;
        if (code === AliyunPush.kAliyunPushSuccessCode) {
          setInited(true);
          Alert.alert('设备注册成功');
        } else {
          Alert.alert(
            `设备注册失败, errorCode: ${result.code}`,
            result.errorMsg
          );
        }
      })
      .catch(() => {
        setIsLoading(false);
        Alert.alert('设备注册失败, 未知错误');
      });
  };

  const copyDeviceId = () => {
    Clipboard.setString(deviceId);
    Alert.alert('已复制', '设备ID已复制到粘贴板');
  };

  const getDeviceId = () => {
    AliyunPush.getDeviceId().then((freshDeviceId) => {
      if (freshDeviceId === null) {
        Alert.alert('设备ID为空', '请先完成设备注册');
      } else {
        setDeviceId(freshDeviceId);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SDK初始化 */}
        <Text style={styles.sectionHeader}>SDK初始化</Text>
        <SectionCard>
          <CustomButton
            title="设置日志等级"
            onPress={openLogLevelModal}
            disabled={isLoading || inited}
            style={styles.actionButton}
          />
          <CustomButton
            title="注册设备"
            onPress={initAliyunPush}
            disabled={isLoading}
            style={styles.actionButton}
          />
          <CustomButton
            title="查询设备ID"
            onPress={getDeviceId}
            style={styles.actionButton}
          />
          <SectionCard>
            <TouchableOpacity onPress={copyDeviceId} activeOpacity={0.7}>
              <Text style={styles.deviceIdText}>{deviceId}</Text>
              <Text style={styles.copyText}>点击复制</Text>
            </TouchableOpacity>
          </SectionCard>
        </SectionCard>

        {/* SDK功能体验 */}
        <Text style={styles.sectionHeader}>SDK功能体验</Text>
        <SectionCard>
          <View style={styles.apiButtonContainer}>
            <TouchableOpacity
              style={[styles.apiButton, styles.commonButton]}
              onPress={() => navigation.navigate('Common')}
            >
              <Text style={styles.apiButtonText}>通用接口</Text>
              <Text style={styles.apiButtonSubText}>账号 | 标签 | 别名</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.apiButton, styles.androidButton]}
              onPress={() => navigation.navigate('Android')}
            >
              <Text style={styles.apiButtonText}>Android接口</Text>
              <Text style={styles.apiButtonSubText}>平台特定功能</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.apiButton, styles.iosButton]}
              onPress={() => navigation.navigate('IOS')}
            >
              <Text style={styles.apiButtonText}>iOS接口</Text>
              <Text style={styles.apiButtonSubText}>平台特定功能</Text>
            </TouchableOpacity>
          </View>
        </SectionCard>

        {/* Demo信息 */}
        <Text style={styles.sectionHeader}>Demo信息</Text>
        <SectionCard>
          <Text>AppKey: {pushConfig?.appKey}</Text>
          <Text>
            {Platform.select({ ios: 'BundleId', android: 'PackageName' })}:{' '}
            {DeviceInfo.getBundleId()}
          </Text>
        </SectionCard>

        {/* SDK推送事件Callback */}
        <Text style={styles.sectionHeader}>SDK推送事件Callback</Text>
        <SectionCard>
          {callbackEvents.length === 0 ? (
            <Text style={styles.noEventsText}>暂无事件</Text>
          ) : (
            callbackEvents.map((event) => (
              <View key={event.id} style={styles.eventItem}>
                <View style={styles.eventContentContainer}>
                  <View style={styles.eventTextContainer}>
                    <Text style={styles.eventTime}>{event.time}</Text>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventContent}>{event.content}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyIconContainer}
                    onPress={() => Clipboard.setString(event.content)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.copyIcon}>📋</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </SectionCard>

        {/* 注册中对话框 */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={isLoading}
          onRequestClose={() => {}}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.modalText}>正在注册...</Text>
            </View>
          </View>
        </Modal>

        {/* 日志级别选择对话框 */}
        <Modal
          transparent={true}
          visible={isLogLevelModalVisible}
          onRequestClose={cancelLogLevel}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>选择日志级别</Text>
              {logLevels.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.logLevelOption,
                    selectedLogLevel === item.id &&
                      styles.logLevelOptionSelected,
                  ]}
                  onPress={() => setSelectedLogLevel(item.id)}
                >
                  <Text style={styles.logLevelOptionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.modalButtonRow}>
                <CustomButton
                  title="取消"
                  onPress={cancelLogLevel}
                  style={[styles.modalButton, styles.cancelButton]}
                />
                <CustomButton
                  title="保存"
                  onPress={saveLogLevel}
                  style={[styles.modalButton, styles.saveButton]}
                />
              </View>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 8,
  },
  selectButton: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    marginVertical: 4,
  },
  deviceIdText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
    marginTop: 4,
  },
  copyText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  apiButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  apiButton: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
  },
  commonButton: {
    backgroundColor: '#007AFF',
  },
  androidButton: {
    backgroundColor: '#34C759',
  },
  iosButton: {
    backgroundColor: '#FF9500',
  },
  apiButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  apiButtonSubText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  logLevelOption: {
    padding: 12,
    width: '100%',
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#f5f5f5',
  },
  logLevelOptionSelected: {
    backgroundColor: '#007AFF',
  },
  logLevelOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
  eventItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTextContainer: {
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  eventContent: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  copyIconContainer: {
    padding: 8,
  },
  copyIcon: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default HomeScreen;
