import { forwardRef, useImperativeHandle, useState } from 'react'
import styles from './index.less'
import { CloseOutlined } from '@ant-design/icons'

export default forwardRef(function GlobalAlert({
    children,
    onClose = () => {}
}: { children?: any,onClose?: any }, ref: any) {

    const [visiable, setVisiable] = useState<boolean>(false)

    useImperativeHandle(ref, () => {
        return {
            on: () => {
                if (!visiable) {
                    setVisiable(true)
                }
            },
            off: (_msg?: string) => {
                setVisiable(false)
            }
        }
    }, [])

    return <>
        <div className={`${styles['alert-content']} ${visiable ? 'alert-content__visiable' : 'alert-content__close'}`}>{children}<CloseOutlined className={styles['alert-content__close']} onClick={() => {
            setVisiable(false)
            onClose()
        }} /></div>
    </>
})