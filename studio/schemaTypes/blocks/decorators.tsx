import type {ReactNode} from 'react'

export function HighlightDecorator(props: {children: ReactNode}) {
  return (
    <span style={{backgroundColor: '#e0bfc4', color: '#262223', padding: '0 0.2em'}}>
      {props.children}
    </span>
  )
}

export function PinkDecorator(props: {children: ReactNode}) {
  return <span style={{color: '#b88a90'}}>{props.children}</span>
}
