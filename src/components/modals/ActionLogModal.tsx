'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ActionLog } from '@/interfaces/ActionLog';
import { formatWibDate } from '@/lib/formatters';

interface ActionLogModalProps {
  open: boolean;
  onClose: () => void;
  logData: ActionLog | null;
}

export default function ActionLogModal({ open, onClose, logData }: ActionLogModalProps) {
  if (!logData) return null;
  const meta = logData.meta || {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>API Log Detail</DialogTitle>
        </DialogHeader>
        <div className="text-sm space-y-4">
          <div>
            <strong>Action:</strong> {logData.action}
          </div>
          <div>
            <strong>Resource Type:</strong> {logData.resourceType}
          </div>
          <div>
            <strong>Resource ID:</strong> {logData.resourceId}
          </div>
          <div>
            <strong>Name:</strong> {logData.userName}
          </div>
          <div>
            <strong>Timestamp:</strong> {formatWibDate(logData.timestamp) ?? '-'}
          </div>
          <div>
            <label className="block font-medium mb-1">Meta:</label>
            <textarea
              value={JSON.stringify(meta, null, 2)}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100 h-64 resize-none font-mono"
            />
          </div>
        </div>
        <div className="pt-4 text-right">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}