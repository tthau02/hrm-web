import React from 'react';
import { Row, Col, Card, Typography, Table, Tag, Space, Avatar, Badge, Spin } from 'antd';
import {
  TeamOutlined,
  UserSwitchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ReactECharts from 'echarts-for-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { useDashboardStatsQuery, useEmployeesQuery } from '@/hooks/useHrmQuery';
import { formatDate, getStatusConfig } from '@/utils/format';
import type { Employee, EmployeeStatus } from '@/types';

const { Text } = Typography;

export const DashboardPage: React.FC = () => {
  const { data: statsResponse, isLoading: isStatsLoading } = useDashboardStatsQuery();
  const { data: empResponse, isLoading: isEmpLoading } = useEmployeesQuery();

  const stats = statsResponse?.data;
  const recentEmployees = (empResponse?.data || []).slice(0, 5);

  // ECharts Option: Hiring Trend
  const hiringTrendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#e6e5e0',
      textStyle: { color: '#26251e' },
    },
    legend: {
      data: ['Tuyển mới', 'Nghỉ việc'],
      top: 0,
      right: 10,
      textStyle: { color: '#5a5852', fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stats?.hiringTrend.map((item) => item.month) || [],
      axisLine: { lineStyle: { color: '#e6e5e0' } },
      axisLabel: { color: '#807d72', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { stroke: '#efeee8', type: 'dashed' } },
      axisLabel: { color: '#807d72', fontSize: 12 },
    },
    series: [
      {
        name: 'Tuyển mới',
        type: 'line',
        smooth: true,
        data: stats?.hiringTrend.map((item) => item.hires) || [],
        itemStyle: { color: '#f54e00' },
        lineStyle: { width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 78, 0, 0.22)' },
              { offset: 1, color: 'rgba(245, 78, 0, 0.01)' },
            ],
          },
        },
      },
      {
        name: 'Nghỉ việc',
        type: 'line',
        smooth: true,
        data: stats?.hiringTrend.map((item) => item.departures) || [],
        itemStyle: { color: '#26251e' },
        lineStyle: { width: 2, type: 'dashed' },
      },
    ],
  };

  // ECharts Option: Department Distribution
  const departmentPieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} nhân sự ({d}%)',
      backgroundColor: '#ffffff',
      borderColor: '#e6e5e0',
      textStyle: { color: '#26251e' },
    },
    legend: {
      bottom: 0,
      left: 'center',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#5a5852', fontSize: 11 },
    },
    color: ['#f54e00', '#1f8a65', '#9fbbe0', '#c0a8dd', '#dfa88f', '#c08532'],
    series: [
      {
        name: 'Cơ cấu phòng ban',
        type: 'pie',
        radius: ['48%', '74%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: '600',
            color: '#26251e',
          },
        },
        data: stats?.departmentDistribution || [],
      },
    ],
  };

  // ECharts Option: Attendance Status
  const attendanceTrendOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#e6e5e0',
      textStyle: { color: '#26251e' },
    },
    legend: {
      data: ['Đúng giờ', 'Đi muộn', 'Vắng mặt'],
      top: 0,
      right: 10,
      textStyle: { color: '#5a5852', fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: stats?.attendanceTrend.map((i) => i.day) || [],
      axisLabel: { color: '#807d72', fontSize: 12 },
      axisLine: { lineStyle: { color: '#e6e5e0' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#807d72', fontSize: 12 },
      splitLine: { lineStyle: { stroke: '#efeee8', type: 'dashed' } },
    },
    series: [
      {
        name: 'Đúng giờ',
        type: 'bar',
        stack: 'total',
        data: stats?.attendanceTrend.map((i) => i.present) || [],
        itemStyle: { color: '#1f8a65', borderRadius: [0, 0, 4, 4] },
      },
      {
        name: 'Đi muộn',
        type: 'bar',
        stack: 'total',
        data: stats?.attendanceTrend.map((i) => i.late) || [],
        itemStyle: { color: '#c08532' },
      },
      {
        name: 'Vắng mặt',
        type: 'bar',
        stack: 'total',
        data: stats?.attendanceTrend.map((i) => i.absent) || [],
        itemStyle: { color: '#cf2d56', borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const recentColumns: ColumnsType<Employee> = [
    {
      title: 'Nhân viên',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.fullName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phòng ban',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (dept: string) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Ngày gia nhập',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: EmployeeStatus) => {
        const config = getStatusConfig(status);
        return <Badge status={config.badgeStatus} text={config.text} />;
      },
    },
  ];

  if (isStatsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải dữ liệu báo cáo..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tổng quan Nhân sự"
        subtitle="Báo cáo phân tích thời gian thực về nhân lực, biến động và tỷ lệ chuyên cần"
      />

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="TỔNG NHÂN SỰ"
            value={stats?.totalEmployees || 0}
            suffix="người"
            icon={<TeamOutlined />}
            iconBgColor="rgba(245, 78, 0, 0.08)"
            iconColor="#f54e00"
            trend={{ value: 12.5, isUp: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="ĐANG LÀM VIỆC"
            value={stats?.activeEmployees || 0}
            suffix="nhân sự"
            icon={<UserSwitchOutlined />}
            iconBgColor="rgba(31, 138, 101, 0.08)"
            iconColor="#1f8a65"
            trend={{ value: 8.2, isUp: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="TỶ LỆ CHUYÊN CẦN HÔM NAY"
            value={`${stats?.attendanceRate || 94.2}%`}
            icon={<CheckCircleOutlined />}
            iconBgColor="rgba(159, 187, 224, 0.15)"
            iconColor="#26251e"
            trend={{ value: 1.4, isUp: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="TỶ LỆ NGHỈ VIỆC (TURNOVER)"
            value={`${stats?.turnoverRate || 2.1}%`}
            icon={<ClockCircleOutlined />}
            iconBgColor="rgba(192, 133, 50, 0.12)"
            iconColor="#c08532"
            trend={{ value: 0.5, isUp: false }}
          />
        </Col>
      </Row>

      {/* ECharts Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={<span style={{ fontWeight: 500, color: '#26251e', fontSize: 14 }}>Xu hướng Tuyển dụng & Biến động nhân sự</span>}
            bordered={false}
            style={{ borderRadius: 12, border: '1px solid #e6e5e0', background: '#ffffff' }}
          >
            <ReactECharts
              option={hiringTrendOption}
              style={{ height: 320, width: '100%' }}
              notMerge={true}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<span style={{ fontWeight: 500, color: '#26251e', fontSize: 14 }}>Cơ cấu nhân sự theo Phòng ban</span>}
            bordered={false}
            style={{ borderRadius: 12, border: '1px solid #e6e5e0', background: '#ffffff' }}
          >
            <ReactECharts
              option={departmentPieOption}
              style={{ height: 320, width: '100%' }}
              notMerge={true}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={10}>
          <Card
            title={<span style={{ fontWeight: 500, color: '#26251e', fontSize: 14 }}>Thống kê Chấm công tuần này</span>}
            bordered={false}
            style={{ borderRadius: 12, border: '1px solid #e6e5e0', background: '#ffffff' }}
          >
            <ReactECharts
              option={attendanceTrendOption}
              style={{ height: 300, width: '100%' }}
              notMerge={true}
            />
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ fontWeight: 500, color: '#26251e', fontSize: 14 }}>Nhân sự gia nhập gần đây</span>}
            bordered={false}
            style={{ borderRadius: 12, border: '1px solid #e6e5e0', background: '#ffffff' }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              columns={recentColumns}
              dataSource={recentEmployees}
              rowKey="id"
              pagination={false}
              loading={isEmpLoading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
