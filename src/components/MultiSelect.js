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
      <button
          key={value}
          type="button"
          className={cx('MultiSelect-item list-group-item')}
          onClick={() => onChange(value, !values[value])} >
        <i
          className={values[value] ? 'fa fa-check-square-o' : 'fa fa-square-o'}
        />&nbsp;
        { value }
      </button>
    )

    return (
      <div
        ref='container'
        className={cx('MultiSelect dropdown', { open: visible })}
      >
        <button
          ref='button'
          type='button'
          className='MultiSelect-button btn btn-default'
          onClick={this.onClick}
        >
          <span>
            { checkedValues.join(', ') || 'No value selected' }
          </span>
          <i className='glyphicon glyphicon-chevron-down' />
        </button>
        <div
          ref='list'
          className='MultiSelect-list dropdown-menu'
        >
          { items }
          { items.length === 0 && <div className='list-group-item'><i>No items</i></div> }
        </div>
      </div>
    )
  }
}

export default MultiSelect;
