import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AndroidPage, IOSPage, CommonPage, HomeScreen } from './pages';

type RootStackParamList = {
  Home: undefined;
  Common: undefined;
  Android: undefined;
  IOS: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={{ title: 'AliyunPush RN Demo' }}
          component={HomeScreen}
        />
        <Stack.Screen
          name="Common"
          options={{ title: '通用接口（账号|标签|别名）' }}
          component={CommonPage}
        />
        <Stack.Screen
          name="Android"
          options={{ title: 'Android其他接口' }}
          component={AndroidPage}
        />
        <Stack.Screen
          name="IOS"
          options={{ title: 'iOS其他接口' }}
          component={IOSPage}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
