import { createStackNavigator } from '@react-navigation/stack';
import { AuthScreen } from '../../../screens';
import { AppRoutes } from '../../../types';

const Stack = createStackNavigator<AppRoutes>();

export function AuthStack() {
  const handleLogin = () => {
    // This will be handled by the AuthScreen component
    // The user state update will trigger navigation change
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="auth-screen"
        options={{
          headerShown: false,
        }}
      >
        {() => <AuthScreen onLogin={handleLogin} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}