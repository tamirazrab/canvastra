"use client";

import { useState } from "react";

export type FailModalVm = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export default class FailModalVM {
  useVM(): FailModalVm {
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
