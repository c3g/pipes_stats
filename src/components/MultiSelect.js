import React, { Component } from 'react'
import cx from 'classname'
import Icon from './Icon'

class MultiSelect extends Component {
  constructor(props) {
    super(props)
    this.buttonRef = React.createRef()
    this.listRef = React.createRef()
    this.onDocumentClick = this.onDocumentClick.bind(this)
    this.onClick = this.onClick.bind(this)
    this.state = { visible: false }
  }

  componentDidMount() {
    document.addEventListener('click', this.onDocumentClick)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onDocumentClick)
  }

  onDocumentClick(event) {
    if (this.state.visible
        && this.buttonRef.current && this.listRef.current
        && event.target !== this.buttonRef.current
        && event.target !== this.listRef.current
        && !this.buttonRef.current.contains(event.target)
        && !this.listRef.current.contains(event.target))
      this.setState({ visible: false })
  }

  onClick() {
    this.setState(prevState => ({ visible: !prevState.visible }))
  }

  render() {
    const { label, values, onChange, loading, className } = this.props
    const { visible } = this.state

    const allValues = Object.keys(values)
    const checkedValues = allValues.filter(v => values[v])
    const allSelected = Object.values(values).every(x => x)
    const total = allValues.length
    const buttonLabel =
      total === 0 ? (loading ? 'Loading...' : 'No items') :
      allSelected ? `All (${total})` :
      checkedValues.length === 0 ? 'None selected' :
      checkedValues.length <= 2 ? checkedValues.join(', ') :
      `${checkedValues.length} of ${total}`
    const longestKey = allValues.reduce((a, b) => b.length > a.length ? b : a, buttonLabel)

    const items = Object.keys(values).map(value =>
      <li key={value}>
        <a
          href='#'
          className='MultiSelect-item'
          onClick={(e) => { e.preventDefault(); onChange(value, !values[value]) }}
        >
          <Icon name={values[value] ? 'check-square-o' : 'square-o'} />&nbsp;{value}
        </a>
      </li>
    )

    return (
      <div className={cx('MultiSelect', { 'input-group': Boolean(label) }, className)}>
        {label && <span className='MultiSelect-label input-group-text'>{label}</span>}
        <div className={cx('dropdown', { show: visible })} style={{ flex: '1 1 auto', minWidth: 0 }}>
          <button
            ref={this.buttonRef}
            type='button'
            className='MultiSelect-button btn btn-secondary dropdown-toggle'
            style={{ position: 'relative' }}
            onClick={this.onClick}
            disabled={loading}
          >
            <span style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>{longestKey}</span>
            <span style={{ position: 'absolute', top: 0, right: 30, bottom: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{buttonLabel}</span>
          </button>
          <Icon className='MultiSelect-icon' name={loading ? 'spinner fa-spin' : 'chevron-down'} />
          <ul ref={this.listRef} className={cx('MultiSelect-list dropdown-menu', { show: visible })} style={{ zIndex: 1050 }}>
            {items.length > 0 && (
              <li>
                <a
                  href='#'
                  className='MultiSelect-item'
                  onClick={(e) => { e.preventDefault(); this.props.onChangeAll(!allSelected) }}
                >
                  <i className={allSelected ? 'fa fa-check-square-o' : 'fa fa-square-o'} /> Select All
                </a>
              </li>
            )}
            <li className='dropdown-divider' role='separator' />
            {items}
            {items.length === 0 && (
              <li className='disabled'>
                <a href='#'><i>No items</i></a>
              </li>
            )}
          </ul>
        </div>
      </div>
    )
  }
}

export default MultiSelect
