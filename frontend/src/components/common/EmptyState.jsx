import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export default function EmptyState({
  icon: Icon = InboxIcon,
  title = 'No data found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
}) {
  return (
    <Box sx={{
      textAlign: 'center', py: 8, px: 3,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <Icon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
        {title}
      </Typography>
      <Typography sx={{ color: 'text.disabled', maxWidth: 400, mb: actionLabel ? 3 : 0 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
