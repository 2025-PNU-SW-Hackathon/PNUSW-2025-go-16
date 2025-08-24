import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface HostBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: 'crown' | 'badge' | 'simple';
}

const HostBadge: React.FC<HostBadgeProps> = ({ 
  size = 'medium', 
  showText = true,
  style = 'crown'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'px-1.5 py-0.5',
          text: 'text-xs',
          iconSize: 10
        };
      case 'large':
        return {
          container: 'px-3 py-1.5',
          text: 'text-sm',
          iconSize: 16
        };
      default: // medium
        return {
          container: 'px-2 py-1',
          text: 'text-xs',
          iconSize: 12
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const renderCrownStyle = () => (
    <View className={`flex-row items-center bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full ${sizeClasses.container} border border-yellow-200`}>
      <Text style={{ fontSize: sizeClasses.iconSize }}>👑</Text>
      {showText && (
        <Text className={`${sizeClasses.text} font-bold text-yellow-700 ml-1`}>
          방장
        </Text>
      )}
    </View>
  );

  const renderBadgeStyle = () => (
    <View className={`flex-row items-center bg-orange-500 rounded-md ${sizeClasses.container} shadow-sm`}>
      <Text style={{ fontSize: sizeClasses.iconSize, color: '#FFFFFF' }}>⭐</Text>
      {showText && (
        <Text className={`${sizeClasses.text} font-bold text-white ml-1`}>
          방장
        </Text>
      )}
    </View>
  );

  const renderSimpleStyle = () => (
    <View className={`flex-row items-center bg-orange-50 rounded-full ${sizeClasses.container} border border-orange-200`}>
      <View className="w-2 h-2 bg-orange-500 rounded-full" />
      {showText && (
        <Text className={`${sizeClasses.text} font-semibold text-orange-700 ml-1`}>
          방장
        </Text>
      )}
    </View>
  );

  switch (style) {
    case 'badge':
      return renderBadgeStyle();
    case 'simple':
      return renderSimpleStyle();
    default:
      return renderCrownStyle();
  }
};

export default HostBadge;

