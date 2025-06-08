import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SERVICE_TYPES, OUTAGE_STATUS } from '@/data/locations';
import { Zap, Droplets, Wifi, MapPin, Clock } from 'lucide-react-native';

interface OutageReport {
  id: string;
  userId: string;
  userName: string;
  city: string;
  neighborhood: string;
  serviceType: string;
  status: string;
  description?: string;
  timestamp: Date;
  imageUrl?: string;
}

interface OutageCardProps {
  report: OutageReport;
  onPress?: () => void;
}

export function OutageCard({ report, onPress }: OutageCardProps) {
  const { colors } = useTheme();

  const serviceType = SERVICE_TYPES.find(s => s.id === report.serviceType);
  const status = OUTAGE_STATUS.find(s => s.id === report.status);

  const getServiceIcon = () => {
    switch (report.serviceType) {
      case 'electricity':
        return <Zap size={20} color={serviceType?.color} />;
      case 'water':
        return <Droplets size={20} color={serviceType?.color} />;
      case 'internet':
        return <Wifi size={20} color={serviceType?.color} />;
      default:
        return <Zap size={20} color={serviceType?.color} />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.serviceInfo}>
          {getServiceIcon()}
          <Text style={[styles.serviceName, { color: colors.text }]}>
            {serviceType?.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: status?.color + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: status?.color }]}>
              {status?.name}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.location}>
        <MapPin size={16} color={colors.textSecondary} />
        <Text style={[styles.locationText, { color: colors.textSecondary }]}>
          {report.neighborhood}, {report.city}
        </Text>
      </View>

      {report.description && (
        <Text style={[styles.description, { color: colors.text }]}>
          {report.description}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={[styles.userName, { color: colors.textSecondary }]}>
          Par {report.userName}
        </Text>
        <View style={styles.timestamp}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={[styles.timestampText, { color: colors.textSecondary }]}>
            {getTimeAgo(report.timestamp)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
});