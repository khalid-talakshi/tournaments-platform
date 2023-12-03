import * as Dialog from "@radix-ui/react-dialog";
import { AiFillCloseCircle } from "react-icons/ai";

export interface Props {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ showModal, setShowModal, title, children }: Props) => {
  return (
    <Dialog.Root open={showModal} onOpenChange={setShowModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50">
          <Dialog.Content className="bg-slate-600 fixed top-[50%] left-[50%] rounded-md translate-x-[-50%] translate-y-[-50%] p-4 shadow-xl shadow-slate-950">
            <Dialog.Title className="flex justify-between items-center text-xl">
              <p>{title}</p>
              <Dialog.Close asChild>
                <AiFillCloseCircle className="hover:fill-red-900 hover:cursor-pointer transition-colors ease-in-out" />
              </Dialog.Close>
            </Dialog.Title>
            <Dialog.Description>{children}</Dialog.Description>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
