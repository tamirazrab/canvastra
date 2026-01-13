"use client";

import { useState } from "react";

export type SuccessModalVm = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export default class SuccessModalVM {
  useVM(): SuccessModalVm {
    const [isOpen, setIsOpen] = useState(false);

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    return {
      isOpen,
      onOpen,
      onClose,
    };
  }
}
