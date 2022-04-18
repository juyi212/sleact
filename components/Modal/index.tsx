import { CreateModal, CloseModalButton } from '@components/Modal/styles';
import React, { FC, PropsWithChildren, useCallback } from 'react';

interface Props {
    children: React.ReactNode
    show: boolean;
    onCloseModal: () => void;
  }

const Modal:  React.FC<Props>  = ({ show, children, onCloseModal }) => {
    const stopPropagation = useCallback((e: any) => {
        e.stopPropagation()
    }, [])  

    if (!show) {
        return null;
    }

    return (
        <CreateModal onClick = {onCloseModal}>
            <div onClick={stopPropagation}>
             <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
             {children}
            </div>
        </CreateModal>
    )
}



export default Modal;