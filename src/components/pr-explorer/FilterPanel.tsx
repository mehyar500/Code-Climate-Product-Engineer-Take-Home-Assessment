import React from 'react';
import {
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Autocomplete,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import type { FilterOptions, PRStatus } from '../../types';

interface FilterPanelProps {
  filters: FilterOptions;
  onDateRangeChange: (start: string | null, end: string | null) => void;
  onStatusChange: (status: PRStatus[]) => void;
  onRepositoryChange: (repo: string | undefined) => void;
  onAtRiskToggle: () => void;
  onReset: () => void;
}

const STATUS_OPTIONS: PRStatus[] = ['open', 'closed', 'merged'];

export function FilterPanel({
  filters,
  onDateRangeChange,
  onStatusChange,
  onRepositoryChange,
  onAtRiskToggle,
  onReset,
}: FilterPanelProps) {
  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    onDateRangeChange(
      date?.startOf('day').toISOString() ?? null,
      filters.dateRange.end
    );
  };

  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    onDateRangeChange(
      filters.dateRange.start,
      date?.endOf('day').toISOString() ?? null
    );
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label="From Date"
            value={filters.dateRange.start ? dayjs(filters.dateRange.start) : null}
            onChange={handleStartDateChange}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label="To Date"
            value={filters.dateRange.end ? dayjs(filters.dateRange.end) : null}
            onChange={handleEndDateChange}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            multiple
            options={STATUS_OPTIONS}
            value={filters.status ?? []}
            onChange={(_, newValue) => onStatusChange(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Status" placeholder="Select status" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Repository"
            placeholder="owner/repo"
            value={filters.repository ?? ''}
            onChange={(e) => onRepositoryChange(e.target.value || undefined)}
            required
            error={!filters.repository}
            helperText={!filters.repository ? 'Repository is required' : 'Format: owner/repo'}
          />
        </Grid>
      </Grid>

      {!filters.repository && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please enter a repository in the format "owner/repo" to start searching pull requests
        </Alert>
      )}

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={filters.showAtRisk}
              onChange={onAtRiskToggle}
            />
          }
          label="Show At Risk PRs Only"
        />
        <Button variant="outlined" onClick={onReset}>
          Reset Filters
        </Button>
      </Box>
    </Box>
  );
} 