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

const CommonPage: React.FC = () => {
  const [account, setAccount] = useState('');
  const [boundAccount, setBoundAccount] = useState('');
  const [aliasAdded, setAliasAdded] = useState('');
  const [aliasRemoved, setAliasRemoved] = useState('');
  const [deviceTag, setDeviceTag] = useState('');
  const [deviceTagRemoved, setDeviceTagRemoved] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBindAccount = async () => {
    if (!account) {
      Alert.alert('错误', '请输入要绑定的账号');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AliyunPush.bindAccount(account);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', `账号 ${account} 绑定成功 👋`);
        setBoundAccount(account);
        setAccount('');
      } else {
        Alert.alert('错误', `绑定账号失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '绑定账号失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbindAccount = async () => {
    setIsLoading(true);
    try {
      const result = await AliyunPush.unbindAccount();
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', '账号解绑成功 👋');
        setBoundAccount('');
      } else {
        Alert.alert('错误', `解绑账号失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '解绑账号失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAlias = async () => {
    if (!aliasAdded) {
      Alert.alert('错误', '请输入要添加的别名');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AliyunPush.addAlias(aliasAdded);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', '别名添加成功 👋');
        setAliasAdded('');
      } else {
        Alert.alert('错误', `添加别名失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '添加别名失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAlias = async () => {
    if (!aliasRemoved) {
      Alert.alert('错误', '请输入要删除的别名');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AliyunPush.removeAlias(aliasRemoved);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', '别名删除成功 👋');
        setAliasRemoved('');
      } else {
        Alert.alert('错误', `删除别名失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '删除别名失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleListAlias = async () => {
    setIsLoading(true);
    try {
      const result = await AliyunPush.listAlias();
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        const aliases = result.aliasList || '无';
        Alert.alert('成功', `别名列表: ${aliases}`);
      } else {
        Alert.alert('错误', `查询别名列表失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert('错误', '查询别名列表失败: 未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDeviceTag = async () => {
    if (!deviceTag) {
      Alert.alert('错误', '请输入要添加的设备标签');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AliyunPush.bindDeviceTag([deviceTag]);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', `设备标签 ${deviceTag} 添加成功 👋`);
        setDeviceTag('');
      } else {
        Alert.alert('错误', `添加设备标签失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert(
        '错误',
        `添加设备标签失败: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDeviceTag = async () => {
    if (!deviceTagRemoved) {
      Alert.alert('错误', '请输入要删除的设备标签');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AliyunPush.unbindDeviceTag([deviceTagRemoved]);
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功', `设备标签 ${deviceTagRemoved} 删除成功 👋`);
        setDeviceTagRemoved('');
      } else {
        Alert.alert('错误', `删除设备标签失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert(
        '错误',
        `删除设备标签失败: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleListDeviceTags = async () => {
    setIsLoading(true);
    try {
      const result = await AliyunPush.listDeviceTags();
      if (result.code === AliyunPush.kAliyunPushSuccessCode) {
        const tags = result.tagsList || '无';
        Alert.alert('成功', `设备标签列表: ${tags}`);
      } else {
        Alert.alert('错误', `查询设备标签列表失败: ${result.errorMsg}`);
      }
    } catch (error) {
      Alert.alert(
        '错误',
        `查询设备标签列表失败: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 账号管理 */}
        <Text style={styles.sectionHeader}>账号管理</Text>
        <SectionCard>
          <TextInput
            style={styles.input}
            onChangeText={setAccount}
            value={account}
            placeholder="输入要绑定的账号"
            placeholderTextColor="#666666"
          />
          <CustomButton
            title="绑定账号"
            onPress={handleBindAccount}
            disabled={isLoading}
          />
          <Text style={styles.infoText}>
            已绑定账号: {boundAccount || '无'}
          </Text>
          <CustomButton
            title="解绑账号"
            onPress={handleUnbindAccount}
            disabled={isLoading}
          />
        </SectionCard>

        {/* 别名管理 */}
        <Text style={styles.sectionHeader}>别名管理</Text>
        <SectionCard>
          <TextInput
            style={styles.input}
            onChangeText={setAliasAdded}
            value={aliasAdded}
            placeholder="输入要添加的别名"
            placeholderTextColor="#666666"
          />
          <CustomButton
            title="添加别名"
            onPress={handleAddAlias}
            disabled={isLoading}
          />
          <TextInput
            style={styles.input}
            onChangeText={setAliasRemoved}
            value={aliasRemoved}
            placeholder="输入要删除的别名"
            placeholderTextColor="#666666"
          />
          <CustomButton
            title="删除别名"
            onPress={handleRemoveAlias}
            disabled={isLoading}
          />
          <CustomButton
            title="查询别名列表"
            onPress={handleListAlias}
            disabled={isLoading}
          />
        </SectionCard>

        {/* 设备标签 */}
        <Text style={styles.sectionHeader}>设备标签</Text>
        <SectionCard>
          <TextInput
            style={styles.input}
            onChangeText={setDeviceTag}
            value={deviceTag}
            placeholder="输入要添加的设备标签"
            placeholderTextColor="#666666"
          />
          <CustomButton
            title="添加设备标签"
            onPress={handleAddDeviceTag}
            disabled={isLoading}
          />
          <TextInput
            style={styles.input}
            onChangeText={setDeviceTagRemoved}
            value={deviceTagRemoved}
            placeholder="输入要删除的设备标签"
            placeholderTextColor="#666666"
          />
          <CustomButton
            title="删除设备标签"
            onPress={handleRemoveDeviceTag}
            disabled={isLoading}
          />
          <CustomButton
            title="查询设备标签列表"
            onPress={handleListDeviceTags}
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

export default CommonPage;
