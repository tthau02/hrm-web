import React from 'react';
import { Card, Typography, theme as antdTheme } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string | number;
    isUp: boolean;
    text?: string;
  };
  suffix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
  suffix,
}) => {
  const { token } = antdTheme.useToken();

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: 'none',
        transition: 'all 0.2s ease',
      }}
      bodyStyle={{ padding: '20px 22px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: token.colorTextSecondary,
            }}
          >
            {title}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 10 }}>
            <span
              style={{
                fontSize: 28,
                fontWeight: 400,
                color: token.colorTextHeading,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                fontFamily: 'var(--font-sans)',
              }}
            >
              {value}
            </span>
            {suffix && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 13,
                  color: token.colorTextSecondary,
                  fontWeight: 400,
                }}
              >
                {suffix}
              </span>
            )}
          </div>

          {trend && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: trend.isUp ? '#1f8a65' : '#cf2d56',
                  backgroundColor: trend.isUp
                    ? 'rgba(31, 138, 101, 0.12)'
                    : 'rgba(207, 45, 86, 0.12)',
                  padding: '2px 7px',
                  borderRadius: 9999,
                }}
              >
                {trend.isUp ? (
                  <ArrowUpOutlined style={{ marginRight: 3, fontSize: 10 }} />
                ) : (
                  <ArrowDownOutlined style={{ marginRight: 3, fontSize: 10 }} />
                )}
                {trend.value}%
              </span>
              <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                {trend.text || 'so với tháng trước'}
              </Text>
            </div>
          )}
        </div>

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            backgroundColor: iconBgColor || (token.colorFillSecondary),
            color: iconColor || token.colorTextHeading,
            border: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
