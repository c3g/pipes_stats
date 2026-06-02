import React, { Component } from 'react';
import cx from 'classname';

class DropDown extends Component {
  constructor(props) {
    super(props)
    this.buttonRef = React.createRef()
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
        && event.target !== this.buttonRef.current
        && !this.buttonRef.current.contains(event.target))
      this.setState({ visible: false })
  }

  onClick() {
    this.setState(prevState => ({ visible: !prevState.visible }))
  }

  render() {
    const {
        label
      , options
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
        className={cx('DropDown dropdown', { open: visible })}
      >
        <button
          ref={this.buttonRef}
          type='button'
          className={btnClassName}
          onClick={this.onClick}
        >
          { children || label }
        </button>
        <div
          className={listClassName}
        >
          { options.map((d) =>
              <button key={d.label}
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
