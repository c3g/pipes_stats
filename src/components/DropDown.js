import React, { Component } from 'react';
import cx from 'classname';

class DropDown extends Component {
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
        && !this.refs.button.contains(event.target))
      this.setState({ visible: false })
  }

  onClick(event) {
    this.setState({ visible: !this.state.visible })
  }

  render() {
    const {
        label
      , options
      , onChange
      , children
      , size
      , align
    } = this.props
    const { visible } = this.state

    const btnClassName =
      'DropDown-button btn btn-default' + (size ? ` btn-${size}` : '')

    const listClassName =
      'DropDown-list dropdown-menu ' + (align === 'right' ?  'dropdown-menu-right' : '')

    return (
      <div
        ref='container'
        className={cx('DropDown dropdown', { open: visible })}
      >
        <button
          ref='button'
          type='button'
          className={btnClassName}
          onClick={this.onClick}
        >
          { children || label }
        </button>
        <div
          ref='list'
          className={listClassName}
        >
          { options.map((d, i) =>
              <button key={i}
                type='button'
                className={cx('list-group-item', d.className || '')}
                onClick={d.onClick}
              >
                { d.label }
              </button>
          )}
        </div>
      </div>
    )
  }
}

export default DropDown;
