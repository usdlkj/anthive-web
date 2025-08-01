export default interface ModalProps {
  data: any;
  onClose: () => void;
  onSave: (data: any) => void;
  open: boolean;
}