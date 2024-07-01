import React, { useCallback, useEffect } from 'react'
import './loadingbutton.scss'

type LoadingButtonProps = {
  children: React.ReactNode,
  disabled?: boolean,
  onClick: () => void | Promise<void>
}

export function LoadingButton({ children, disabled, onClick }: LoadingButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [failure, setFailure] = React.useState(false)

  useEffect(() => {
    if (!isLoading && failure) { setTimeout(() => setFailure(false), 5000) }
  }, [isLoading, failure])

  const handleClick = useCallback(async () => {
    setIsLoading(true)
    setFailure(false)
    try {
      await onClick()
    } catch {
      setFailure(true)
    }
    setIsLoading(false)
  }, [onClick])

  const color = failure ? 'var(--accent)' : 'var(--text)'

  return (
    <button className={'loading-button'} disabled={disabled ?? isLoading} onClick={() => void handleClick()}>
      {/* <i className={icon} style={{ color: color }}></i> */}
      {children}
    </button>
  )
}
