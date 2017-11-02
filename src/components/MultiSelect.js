import React, { Component } from 'react';
import cx from 'classname';

class MultiSelect extends Component {
  constructor(props) {
    super(props)
    this.onDocumentClick = this.onDocumentClick.bind(this)
    this.onClick = this.onClick.bind(this)
    this.state = {
      visible: false
    }
  }

  componentDidMount() {
    document.addEventListener('click', this.onDocumentClick)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onDocumentClick)
  }

  onDocumentClick(event) {
    if (this.state.visible
        && event.target !== this.refs.button
        && event.target !== this.refs.list
        && !this.refs.button.contains(event.target)
        && !this.refs.list.contains(event.target))
      this.setState({ visible: false })
  }

  onClick(event) {
    this.setState({ visible: !this.state.visible })
  }

  render() {
    const { values, onChange } = this.props
    const { visible } = this.state

    const checkedValues = Object.keys(values).filter(v => values[v])

    const items = Object.keys(values).map(value =>
      <li>
        <a key={value}
            href='#'
            className='MultiSelect-item'
            onClick={() => onChange(value, !values[value])} >
          <i
            className={values[value] ? 'fa fa-check-square-o' : 'fa fa-square-o'}
          />&nbsp;
          { value }
        </a>
      </li>
    )

    return (
      <div
        ref='container'
        className={cx('MultiSelect dropdown', { open: visible })}
      >
        <button
          ref='button'
          type='button'
          className='MultiSelect-button btn btn-default dropdown-toggle'
          onClick={this.onClick}
        >
          <span>
            { checkedValues.join(', ') || 'No value selected' }
          </span>
        </button>
        <i className='MultiSelect-icon glyphicon glyphicon-chevron-down' />
        <ul
          ref='list'
          className='MultiSelect-list dropdown-menu'
        >
          { items }
          { items.length === 0 &&
            <li className='disabled'>
              <a href='#'>
                <i>No items</i>
              </a>
            </li>
          }
        </ul>
      </div>
    )
  }
}

export default MultiSelect;
