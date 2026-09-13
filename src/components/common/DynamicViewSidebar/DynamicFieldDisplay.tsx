import React from 'react';
import {
  Typography,
  Tag,
  Switch,
  Image,
  Avatar,
  Card,
  Row,
  Col,
  Space,
  Button,
  theme as antdTheme,
} from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  UserOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileOutlined,
  MailOutlined,
} from '@ant-design/icons';
import type { ViewFieldConfig } from './types';
import { formatCurrency, formatDate } from '@/utils/format';
import { StatusBadge } from '../StatusBadge';

const { Text, Paragraph } = Typography;

interface DynamicFieldDisplayProps<T = any> {
  field: ViewFieldConfig<T>;
  value: any;
  data: T;
}

export const DynamicFieldDisplay: React.FC<DynamicFieldDisplayProps> = ({
  field,
  value,
  data,
}) => {
  const { token } = antdTheme.useToken();

  // Custom render hook
  if (field.render) {
    return <>{field.render(value, data)}</>;
  }

  // Title / Section Divider
  if (field.type === 'title' || field.type === 'divider') {
    return (
      <div
        style={{
          paddingTop: 16,
          paddingBottom: 10,
          borderBottom: field.titleConfig?.divider !== false ? `1px solid ${token.colorBorderSecondary}` : undefined,
          marginBottom: 14,
          ...field.titleStyle,
        }}
      >
        <Space size={8} align="center">
          {field.titleConfig?.icon && (
            <span style={{ color: token.colorPrimary, fontSize: 16 }}>
              {field.titleConfig.icon}
            </span>
          )}
          <span
            style={{
              fontSize: field.titleConfig?.fontSize || 14.5,
              fontWeight: 600,
              color: token.colorTextHeading,
            }}
          >
            {field.titleConfig?.text || field.label}
          </span>
        </Space>
      </div>
    );
  }

  // Render Value based on type
  const renderValue = () => {
    if (value === null || value === undefined || value === '') {
      return (
        <span style={{ color: token.colorTextQuaternary, fontStyle: 'italic', fontSize: 13 }}>
          {field.placeholder || '-'}
        </span>
      );
    }

    switch (field.type) {
      case 'email':
        return (
          <a
            href={`mailto:${value}`}
            style={{
              color: token.colorPrimary,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
            }}
          >
            <MailOutlined style={{ fontSize: 12 }} />
            {value}
          </a>
        );

      case 'numberFormatted':
        return (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
            {Number(value).toLocaleString('vi-VN')}
          </span>
        );

      case 'money':
      case 'currency':
        return (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: token.colorTextHeading,
            }}
          >
            {typeof value === 'number' ? formatCurrency(value) : formatCurrency(Number(value))}
          </span>
        );

      case 'date':
        return (
          <span style={{ color: token.colorTextSecondary, fontSize: 13 }}>
            {formatDate(String(value))}
          </span>
        );

      case 'datetime':
        return (
          <span style={{ color: token.colorTextSecondary, fontSize: 13 }}>
            {formatDate(String(value), 'DD/MM/YYYY HH:mm')}
          </span>
        );

      case 'textarea':
        return (
          <Paragraph
            style={{
              marginBottom: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: token.colorText,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {value}
          </Paragraph>
        );

      case 'link':
        return (
          <Button
            type="link"
            style={{ padding: 0, height: 'auto', fontSize: 13 }}
            onClick={() => field.onLinkClick?.(value, data)}
          >
            {value}
          </Button>
        );

      case 'status':
      case 'badge':
        if (field.badgeMap && field.badgeMap[String(value)]) {
          const cfg = field.badgeMap[String(value)];
          return <Tag color={cfg.color}>{cfg.label}</Tag>;
        }
        return <StatusBadge status={String(value)} />;

      case 'checkbox':
      case 'boolean':
        return value ? (
          <Space size={4} style={{ color: '#1f8a65' }}>
            <CheckCircleFilled />
            <span style={{ fontSize: 12.5 }}>Có hiệu lực</span>
          </Space>
        ) : (
          <Space size={4} style={{ color: token.colorTextQuaternary }}>
            <CloseCircleFilled />
            <span style={{ fontSize: 12.5 }}>Không</span>
          </Space>
        );

      case 'toggle':
        return (
          <Switch
            checked={!!value}
            onChange={(checked) => field.onToggleChange?.(checked, data)}
            size="small"
          />
        );

      case 'avatar':
        return (
          <Avatar
            src={value}
            icon={<UserOutlined />}
            size={56}
            style={{
              border: `2px solid ${token.colorBorderSecondary}`,
              backgroundColor: token.colorFillSecondary,
            }}
          />
        );

      case 'image':
        return (
          <Image
            src={value}
            width={120}
            height={120}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' fill='%23ccc'><rect width='120' height='120'/></svg>"
          />
        );

      case 'file': {
        const isPdf = typeof value === 'string' && value.toLowerCase().endsWith('.pdf');
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 6,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              color: token.colorTextHeading,
              fontSize: 13,
            }}
          >
            {isPdf ? <FilePdfOutlined style={{ color: '#cf2d56', fontSize: 16 }} /> : <FileOutlined />}
            <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {typeof value === 'string' ? value.split('/').pop() : 'Tệp đính kèm'}
            </span>
            <DownloadOutlined style={{ color: token.colorPrimary }} />
          </a>
        );
      }

      case 'array':
        if (!Array.isArray(value) || value.length === 0) {
          return (
            <span style={{ color: token.colorTextQuaternary, fontStyle: 'italic', fontSize: 13 }}>
              Không có dữ liệu
            </span>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            {value.map((item, idx) => (
              <Card
                key={idx}
                size="small"
                style={{
                  borderRadius: 8,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  background: token.colorFillAlter,
                }}
              >
                {field.arrayConfig?.showIndex && (
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: token.colorPrimary,
                      marginBottom: 8,
                    }}
                  >
                    #{idx + 1}
                  </div>
                )}
                <Row gutter={[12, 10]}>
                  {field.arrayConfig?.fields.map((subField) => (
                    <Col key={subField.key} span={subField.colSpan || 24}>
                      <DynamicFieldDisplay
                        field={subField}
                        value={item[subField.key]}
                        data={item}
                      />
                    </Col>
                  ))}
                </Row>
              </Card>
            ))}
          </div>
        );

      case 'text':
      default:
        return (
          <Text
            style={{
              color: token.colorTextHeading,
              fontSize: 13,
              fontWeight: 400,
              ...field.contentStyle,
            }}
          >
            {String(value)}
          </Text>
        );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        padding: '6px 0',
      }}
    >
      {field.label && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: token.colorTextSecondary,
            textTransform: 'none',
            letterSpacing: '0.01em',
            ...field.titleStyle,
          }}
        >
          {field.label}
        </span>
      )}
      <div style={{ minHeight: 22, display: 'flex', alignItems: 'center' }}>
        {renderValue()}
      </div>
      {field.description && (
        <span style={{ fontSize: 11, color: token.colorTextTertiary }}>
          {field.description}
        </span>
      )}
    </div>
  );
};
