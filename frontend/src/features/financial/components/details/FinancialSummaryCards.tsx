import React from 'react';
import { Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import type { FinancialSummary } from '../../financial.types';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from '@shared/utils/formatting';

interface FinancialSummaryCardsProps {
  summary: FinancialSummary;
  isSticky: boolean;
  title: string;
  subtitle: string;
  isRefreshing?: boolean;
}

const formatMetricValue = (
  value: number | string | null | undefined,
  formatter: (value: number | string | null | undefined) => string,
  fallback = 'N/A'
) => {
  if (value === null || value === undefined) {
    return fallback;
  }
  return formatter(value);
};

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  summary,
  isSticky,
  title,
  subtitle,
  isRefreshing = false,
}) => {
  const cards = [
    { label: 'Revenue', value: formatMetricValue(summary.total_revenue, formatCurrency) },
    { label: 'Purchase Cost', value: formatMetricValue(summary.total_purchase_cost, formatCurrency) },
    { label: 'COGS', value: formatMetricValue(summary.total_cogs, formatCurrency) },
    { label: 'Profit', value: formatMetricValue(summary.profit, formatCurrency) },
    { label: 'Margin', value: formatMetricValue(summary.profit_margin, formatPercentage) },
    { label: 'Qty Purchased', value: formatMetricValue(summary.quantity_purchased, (value) => formatNumber(value, 4)) },
    { label: 'Qty Sold', value: formatMetricValue(summary.quantity_sold, (value) => formatNumber(value, 4)) },
    { label: 'Qty Remaining', value: formatMetricValue(summary.quantity_remaining, (value) => formatNumber(value, 4)) },
  ];

  return (
    <Paper
      withBorder
      radius="md"
      p="lg"
      style={
        isSticky
          ? {
              position: 'sticky',
              top: 16,
              zIndex: 10,
              backgroundColor: 'var(--mantine-color-body)',
            }
          : undefined
      }
    >
      <Stack gap="lg">
        <Stack gap={2}>
          <Text fw={700} size="lg">
            {title}
          </Text>
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
          {isRefreshing ? (
            <Text size="xs" c="dimmed">
              Refreshing selection summary...
            </Text>
          ) : null}
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          {cards.map((card) => (
            <Paper key={card.label} withBorder radius="md" p="md">
              <Stack gap={4}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {card.label}
                </Text>
                <Text fw={700} size="xl">
                  {card.value}
                </Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
};
