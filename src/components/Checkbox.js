import React from 'react'
import cuid from 'cuid'

class Checkbox extends React.Component {
  id = cuid()

  render() {

    const { checked, children } = this.props

    return (
      <div className='Checkbox'>
        <input type='checkbox'
          id={this.id}
          checked={checked}
        />
        <label for={this.id} onClick={() => this.props.onChange(!checked)}>
          { children }
        </label>
      </div>
    )
  }
}

export default Checkbox
