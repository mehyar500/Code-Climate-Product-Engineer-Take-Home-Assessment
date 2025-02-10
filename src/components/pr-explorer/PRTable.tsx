import React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridValueGetter } from '@mui/x-data-grid';
import { Chip, Link, Box } from '@mui/material';
import type { PullRequest } from '../../types';
import { formatDate, formatRelativeTime } from '../../utils/date';
import { getStatusColor, formatPRStats } from '../../utils/pr-helpers';

interface PRTableProps {
  data: PullRequest[];
}

const columns: GridColDef<PullRequest>[] = [
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params: GridRenderCellParams<PullRequest>) => (
      <Chip
        label={params.value}
        size="small"
        sx={{
          backgroundColor: getStatusColor(params.value),
          color: 'white',
        }}
      />
    ),
  },
  {
    field: 'title',
    headerName: 'Title',
    flex: 1,
    minWidth: 200,
    renderCell: (params: GridRenderCellParams<PullRequest>) => (
      <Link href={`https://github.com/${params.row?.repository?.fullName}/pull/${params.row?.number}`} target="_blank">
        {params.value}
      </Link>
    ),
  },
  {
    field: 'number',
    headerName: 'Number',
    width: 100,
  },
  {
    field: 'repository',
    headerName: 'Repository',
    width: 200,
    valueGetter: ({ row }: { row?: PullRequest } = {}) => row?.repository?.fullName ?? '',
  },
  {
    field: 'author',
    headerName: 'Author',
    width: 150,
    valueGetter: ({ row }: { row?: PullRequest } = {}) => row?.author?.login ?? '',
  },
  {
    field: 'changes',
    headerName: 'Changes',
    width: 120,
    valueGetter: ({ row }: { row?: PullRequest } = {}) => row ? formatPRStats(row) : '',
  },
  {
    field: 'comments',
    headerName: 'Comments',
    width: 100,
    valueGetter: ({ row }: { row?: PullRequest } = {}) => row?.stats?.comments ?? 0,
  },
  {
    field: 'createdAt',
    headerName: 'Opened',
    width: 200,
    valueGetter: ({ row }: { row?: PullRequest } = {}) => row?.dates?.createdAt ?? '',
    renderCell: (params: GridRenderCellParams<PullRequest>) => params.value && (
      <Box>
        {formatDate(params.value)}
        <br />
        <small>{formatRelativeTime(params.value)}</small>
      </Box>
    ),
  },
  {
    field: 'closedAt',
    headerName: 'Closed',
    width: 200,
    valueGetter: ({ row }: { row?: PullRequest } = {}) => row?.dates?.closedAt ?? null,
    renderCell: (params: GridRenderCellParams<PullRequest>) => params.value && (
      <Box>
        {formatDate(params.value)}
        <br />
        <small>{formatRelativeTime(params.value)}</small>
      </Box>
    ),
  },
];

export function PRTable({ data }: PRTableProps) {
  const [pageSize, setPageSize] = React.useState(25);

  return (
    <DataGrid<PullRequest>
      rows={data || []}
      columns={columns}
      initialState={{
        pagination: { paginationModel: { pageSize } },
      }}
      pageSizeOptions={[25, 50, 100]}
      onPaginationModelChange={(model) => setPageSize(model.pageSize)}
      getRowClassName={(params) => params.row?.isAtRisk ? 'at-risk' : ''}
      sx={{
        '& .at-risk': {
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
        },
        minHeight: 400,
      }}
      loading={!data || data.length === 0}
      disableRowSelectionOnClick
      sortingMode="server"
      disableColumnMenu
      getRowId={(row) => row.id}
      autoHeight
    />
  );
} 