"use client";

import { useState } from "react";

export type SubscriptionModalVm = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export default class SubscriptionModalVM {
  useVM(): SubscriptionModalVm {
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
