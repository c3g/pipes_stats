import React from 'react'

export default function Icon({ name, className }) {
  const iconClassName = ['Icon fa', `fa-${name}`, className].join(' ')
  return (
    <i className={iconClassName} />
  )
}
