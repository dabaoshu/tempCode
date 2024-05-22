import React from 'react'
import styles from './index.module.less'
import classnames from 'classnames'

const ListTable = ({ list }) => {
  return <div className={styles.listTable}>
    {
      list.map(o => {
        return <div key={o.title} className={styles.listItem}>
          <div className={styles.title}>
            {o.title}
          </div>
          <div className={styles.val}>
            {o.value}
          </div>
        </div>
      })
    }

  </div>

}

export default function ButtomPane({ list }) {
  const lastItem = list[list.length - 1] || {}
  const list1 = [
    { title: "X", value: lastItem.resetX },
    { title: "y", value: lastItem.resetY },
    { title: "z", value: lastItem.resetZ },
    { title: "rotx", value: lastItem.resetRotX },
    { title: "roty", value: lastItem.resetRotY },
    { title: "rotz", value: lastItem.resetRotZ },
    // { title: "vx", value: "62" },
    // { title: "vy", value: "44" },
    // { title: "vz", value: "12" },
    // { title: "wx", value: "13" },
    // { title: "wy", value: "02" },
    // { title: "wz", value: "33" },
  ]
  return (
    <div className={classnames(styles.ButtomPane, 'blue-box-shadow')}>
      <div className={styles.header}>
        实时状态
      </div>
      <ListTable list={list1}></ListTable>
    </div>
  )
}
