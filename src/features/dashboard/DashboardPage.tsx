import React, { useMemo } from 'react';
import { Row, Col, Card, Table, Typography, Space, Tag, Avatar, Button, theme as antdTheme } from 'antd';
import {
  TeamOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ExportOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatCard, StatusBadge, notify } from '@/components/common';
import { useDashboardStatsQuery, useEmployeesQuery } from '@/hooks/useHrmQuery';
import { useAppSelector } from '@/store';
import { colors } from '@/theme/tokens';

const { Text } = Typography;

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = antdTheme.useToken();
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  const { data: statsResponse } = useDashboardStatsQuery();
  const { data: employeesResponse } = useEmployeesQuery();

  const stats = statsResponse?.data;
  const recentEmployees = useMemo(() => {
    return (employeesResponse?.data || []).slice(0, 5);
  }, [employeesResponse?.data]);

  // ECharts Theme Palette based on DESIGN.md
  const chartPalette = useMemo(() => [
    colors.brand.primary,
    colors.timeline.grep,
    colors.timeline.read,
    colors.timeline.edit,
    colors.timeline.done,
    colors.timeline.thinking,
  ], []);

  // Headcount Trend Line Chart Option
  const hiringTrendOption = useMemo(() => {
    const trendData = stats?.hiringTrend || [
      { month: 'T1', hires: 4, departures: 1 },
      { month: 'T2', hires: 3, departures: 0 },
      { month: 'T3', hires: 6, departures: 2 },
      { month: 'T4', hires: 5, departures: 1 },
      { month: 'T5', hires: 7, departures: 1 },
      { month: 'T6', hires: 8, departures: 2 },
      { month: 'T7', hires: 6, departures: 0 },
      { month: 'T8', hires: 9, departures: 1 },
    ];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        borderColor: isDarkMode ? '#2d2d2d' : '#e6e5e0',
        textStyle: { color: isDarkMode ? '#ededed' : '#26251e', fontSize: 12 },
      },
      legend: {
        data: ['Tuyển mới', 'Nghỉ việc'],
        top: 0,
        right: 0,
        textStyle: { color: isDarkMode ? '#a09c92' : '#5a5852', fontSize: 12 },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '40px', containLabel: true },
      xAxis: {
        type: 'category',
        data: trendData.map((d) => d.month),
        axisLine: { lineStyle: { color: isDarkMode ? '#2d2d2d' : '#e6e5e0' } },
        axisLabel: { color: isDarkMode ? '#a09c92' : '#807d72', fontSize: 12 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: isDarkMode ? '#222222' : '#f0efe9', type: 'dashed' } },
        axisLabel: { color: isDarkMode ? '#a09c92' : '#807d72', fontSize: 12 },
      },
      series: [
        {
          name: 'Tuyển mới',
          type: 'line',
          smooth: true,
          data: trendData.map((d) => d.hires),
          itemStyle: { color: colors.brand.primary },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(245, 78, 0, 0.25)' },
                { offset: 1, color: 'rgba(245, 78, 0, 0.0)' },
              ],
            },
          },
        },
        {
          name: 'Nghỉ việc',
          type: 'line',
          smooth: true,
          data: trendData.map((d) => d.departures),
          itemStyle: { color: isDarkMode ? '#6e6b62' : '#cfcdc4' },
          lineStyle: { type: 'dashed' },
        },
      ],
    };
  }, [stats?.hiringTrend, isDarkMode]);

  // Department Donut Chart Option
  const departmentPieOption = useMemo(() => {
    const distData = stats?.departmentDistribution || [
      { name: 'Công Nghệ Thông Tin', value: 14 },
      { name: 'Kinh Doanh & MKT', value: 18 },
      { name: 'Vận Hành & CSKH', value: 9 },
      { name: 'Nhân Sự & Đào Tạo', value: 6 },
      { name: 'Tài Chính - Kế Toán', value: 5 },
    ];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} nhân sự ({d}%)',
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        borderColor: isDarkMode ? '#2d2d2d' : '#e6e5e0',
        textStyle: { color: isDarkMode ? '#ededed' : '#26251e', fontSize: 12 },
      },
      legend: {
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: isDarkMode ? '#a09c92' : '#5a5852', fontSize: 11 },
      },
      series: [
        {
          name: 'Cơ cấu phòng ban',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: isDarkMode ? '#1e1e1e' : '#ffffff',
            borderWidth: 2,
          },
          label: { show: false },
          data: distData.map((item, idx) => ({
            ...item,
            itemStyle: { color: chartPalette[idx % chartPalette.length] },
          })),
        },
      ],
    };
  }, [stats?.departmentDistribution, isDarkMode, chartPalette]);

  return (
    <div>
      <PageHeader
        title="Tổng quan Quản trị Nhân sự"
        subtitle="Báo cáo số liệu tổng hợp tình hình nhân sự, tỷ lệ chuyên cần và biến động trong tổ chức"
        actions={[
          {
            key: 'export',
            label: 'Xuất báo cáo',
            icon: <ExportOutlined />,
            variant: 'secondary',
            onClick: () => notify.info('Xuất báo cáo', 'Báo cáo tổng hợp nhân sự đang được tạo dưới định dạng Excel...'),
          },
          {
            key: 'add-emp',
            label: 'Thêm nhân viên',
            icon: <PlusOutlined />,
            variant: 'primary',
            onClick: () => navigate('/employees'),
          },
        ]}
      />

      {/* 4 StatCards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="TỔNG SỐ NHÂN SỰ"
            value={stats?.totalEmployees || 52}
            suffix="nhân sự"
            icon={<TeamOutlined />}
            iconBgColor="rgba(245, 78, 0, 0.1)"
            iconColor={colors.brand.primary}
            trend={{ value: 8.5, isUp: true, text: 'so với tháng trước' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="PHÒNG BAN HOẠT ĐỘNG"
            value={stats?.totalDepartments || 5}
            suffix="phòng ban"
            icon={<ApartmentOutlined />}
            iconBgColor="rgba(159, 201, 162, 0.15)"
            iconColor={colors.timeline.grep}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="TỶ LỆ ĐI LÀM ĐÚNG GIỜ"
            value={`${stats?.attendanceRate || 94.2}%`}
            icon={<CheckCircleOutlined />}
            iconBgColor="rgba(159, 187, 224, 0.15)"
            iconColor={colors.timeline.read}
            trend={{ value: 1.2, isUp: true, text: 'hôm nay' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="YÊU CẦU CHỜ PHÊ DUYỆT"
            value={5}
            suffix="yêu cầu"
            icon={<ClockCircleOutlined />}
            iconBgColor="rgba(192, 133, 50, 0.15)"
            iconColor={colors.timeline.done}
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={15}>
          <Card
            bordered={false}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: token.colorTextHeading }}>
                  Xu hướng biến động nhân sự
                </span>
                <Tag style={{ borderRadius: 4, border: 'none', background: token.colorFillSecondary, color: token.colorTextSecondary }}>
                  Năm 2026
                </Tag>
              </div>
            }
            style={{
              borderRadius: 12,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
              boxShadow: 'none',
              height: '100%',
            }}
            styles={{ body: { padding: '16px 20px 24px' } }}
          >
            <ReactECharts option={hiringTrendOption} style={{ height: 320 }} notMerge lazyUpdate />
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            bordered={false}
            title={
              <span style={{ fontSize: 15, fontWeight: 600, color: token.colorTextHeading }}>
                Cơ cấu nhân sự theo phòng ban
              </span>
            }
            style={{
              borderRadius: 12,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
              boxShadow: 'none',
              height: '100%',
            }}
            styles={{ body: { padding: '16px 20px 24px' } }}
          >
            <ReactECharts option={departmentPieOption} style={{ height: 320 }} notMerge lazyUpdate />
          </Card>
        </Col>
      </Row>

      {/* Recent Activities & Quick Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Timeline / Activities */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: token.colorTextHeading }}>
                  Nhật ký hoạt động gần đây
                </span>
                <span style={{ fontSize: 12, color: token.colorTextSecondary }}>Hôm nay</span>
              </div>
            }
            style={{
              borderRadius: 12,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
              boxShadow: 'none',
              height: '100%',
            }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { tag: 'ĐỒNG BỘ', color: colors.timeline.thinking, text: 'Hệ thống tự động đồng bộ bảng chấm công tháng 11', time: '09:00' },
                { tag: 'TUYỂN DỤNG', color: colors.timeline.grep, text: 'Tiếp nhận nhân viên mới: Lê Minh Tuấn (Phòng IT)', time: '08:30' },
                { tag: 'DUYỆT ĐƠN', color: colors.timeline.read, text: 'Đã duyệt đơn nghỉ phép của Phạm Hồng Nhung', time: 'Hôm qua' },
                { tag: 'LƯƠNG & BẢNG LƯƠNG', color: colors.timeline.edit, text: 'Cập nhật hệ số lương phòng Kinh Doanh & Marketing', time: '2 ngày trước' },
                { tag: 'ĐÁNH GIÁ', color: colors.timeline.done, text: 'Hoàn tất đánh giá thử việc nhân sự Ngô Mỹ Linh', time: '3 ngày trước' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Tag
                    style={{
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '1px 6px',
                      backgroundColor: `${item.color}25`,
                      borderColor: item.color,
                      color: isDarkMode ? '#ffffff' : '#26251e',
                      margin: 0,
                      flexShrink: 0,
                    }}
                  >
                    {item.tag}
                  </Tag>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 13, color: token.colorTextHeading, display: 'block', lineHeight: 1.4 }}>
                      {item.text}
                    </Text>
                  </div>
                  <Text style={{ fontSize: 11, color: token.colorTextSecondary, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                    {item.time}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Recent Employees Table */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: token.colorTextHeading }}>
                  Nhân viên mới gia nhập
                </span>
                <Button
                  type="link"
                  onClick={() => navigate('/employees')}
                  style={{ padding: 0, fontSize: 13, color: token.colorPrimary, display: 'inline-flex', alignItems: 'center' }}
                >
                  Xem tất cả <ArrowRightOutlined style={{ fontSize: 11, marginLeft: 4 }} />
                </Button>
              </div>
            }
            style={{
              borderRadius: 12,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
              boxShadow: 'none',
              height: '100%',
            }}
            styles={{ body: { padding: 0 } }}
          >
            <Table
              dataSource={recentEmployees}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={[
                {
                  title: 'Nhân viên',
                  dataIndex: 'fullName',
                  key: 'fullName',
                  render: (name: string, record) => (
                    <Space size={10}>
                      <Avatar src={record.avatar} size={32}>
                        {name.charAt(0)}
                      </Avatar>
                      <div>
                        <Text strong style={{ fontSize: 13, color: token.colorTextHeading, display: 'block' }}>
                          {name}
                        </Text>
                        <Text style={{ fontSize: 11, color: token.colorTextSecondary, fontFamily: 'var(--font-mono)' }}>
                          {record.code}
                        </Text>
                      </div>
                    </Space>
                  ),
                },
                {
                  title: 'Phòng ban',
                  dataIndex: 'departmentName',
                  key: 'departmentName',
                  ellipsis: true,
                  render: (dept: string) => <Text style={{ fontSize: 12 }}>{dept}</Text>,
                },
                {
                  title: 'Chức danh',
                  dataIndex: 'position',
                  key: 'position',
                  ellipsis: true,
                  render: (pos: string) => <Text style={{ fontSize: 12 }}>{pos}</Text>,
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => <StatusBadge status={status} />,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
