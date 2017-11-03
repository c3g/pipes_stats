import React from 'react'

export default function Icon({ name, className }) {
  const iconClassName = ['fa', `fa-${name}`, className].join(' ')
  return (
    <i className={iconClassName} />
  )
}
