<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { computed, nextTick, ref, shallowRef } from 'vue'
import numbro from 'numbro'
import { saveAs } from 'file-saver'
import zhCN from '@/assets/zh-CN.json'

type LocalesObj = {
  [key: string]: string | LocalesObj
}

type LocalesKey = {
  key: string
  locales: string | object
}

const dataRes = ref<LocalesObj>(zhCN)

const keyList = computed(() => {
  const keyObjList: LocalesKey[] = []
  /**
   * 铺平
   * @param obj
   * @param parentKey
   */
  const flatObject = (obj: LocalesObj, parentKey: string = '') => {
    const keys = Object.keys(obj)
    keys.forEach(key => {
      const flatKey = parentKey ? `${parentKey}.${key}` : key
      if (typeof obj[key] === 'string') {
        keyObjList.push({
          key: flatKey,
          locales: obj[key],
        })
      } else if (typeof obj[key] === 'object') {
        flatObject(obj[key] as LocalesObj, flatKey)
      }
    })
  }
  flatObject(dataRes.value)
  return keyObjList
})

const translateDelay = ref<number>(1500)
const saveFileName = ref<string>('')
const isTranslating = ref<boolean>(false)
const translatePercent = ref<number>(0)
const showPercentText = computed<string>(() =>
  numbro(translatePercent.value).format({ output: 'percent', mantissa: 1 })
)

const inputRef = shallowRef<HTMLInputElement>()

const previewFile = () => {
  inputRef.value?.click()
}

const saveDataToFile = () => {
  const keyMapElementList = document.querySelectorAll('.key-map')
  const blobData: any = {}
  const setDeepObject = (keyNested: string, value: string) => {
    const keyList = keyNested.split('.')
    const keyDepth = keyList.length - 1
    let item = blobData

    for (let i = 0; i < keyList.length; i++) {
      if (i === keyDepth) {
        item[keyList[i]] = value
      }
      if (item[keyList[i]] === undefined) {
        item[keyList[i]] = {}
      }
      item = item[keyList[i]]
    }
  }
  keyMapElementList.forEach(element => {
    // 获取层级key
    const keyNested = element.getElementsByTagName('pre')[0].dataset
      .key as string
    // 放置value
    const objValue = element.getElementsByClassName('value')[0].innerHTML
    setDeepObject(keyNested, objValue)
  })
  const blob = new Blob([JSON.stringify(blobData)], {
    type: 'text/plain;charset=utf-8',
  })
  saveAs(blob, `${saveFileName.value ? saveFileName.value : 'translate'}.json`)
  setTimeout(() => {
    const body = document.documentElement
    body.scrollTop = 0
  }, translateDelay.value)
}

const getTranslateData = () => {
  if (isTranslating.value) return
  isTranslating.value = true
  translatePercent.value = 0

  const body = document.documentElement
  body.scrollTop = 0

  const timer = setInterval(() => {
    const pageHeight = body.clientHeight
    const endScrollTop = body.offsetHeight - pageHeight
    body.scrollTop = body.scrollTop + pageHeight
    translatePercent.value = body.scrollTop / endScrollTop
    if (body.scrollTop >= endScrollTop) {
      clearInterval(timer)
      isTranslating.value = false
      translatePercent.value = 1
      setTimeout(saveDataToFile, translateDelay.value)
    }
  }, translateDelay.value)
}

const handleSelectFile = (e: any) => {
  const file = e.target.files[0]
  const reader = new FileReader()
  reader.onload = (loadEvent: any) => {
    const jsonStr = loadEvent.target.result as string
    dataRes.value = JSON.parse(jsonStr)
  }
  reader.readAsText(file, 'utf8')
}
</script>

<template>
  <header>
    <div class="logo-tip">
      <a href="https://vitejs.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <span>+</span>
      <a href="https://vuejs.org/" target="_blank">
        <img src="/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
      <div class="tip-hover">
        <img src="/translate-tip.gif" alt="" />
      </div>
    </div>
    <div class="h1">翻译</div>
    <button style="margin-left: 10px" @click="previewFile">
      <code>预览文件</code>
      <input
        ref="inputRef"
        class="preview-file"
        type="file"
        @change="handleSelectFile"
      />
    </button>
    <button style="margin-left: 10px" @click="getTranslateData">
      <code>保存文件</code>
    </button>
    <select style="margin-left: 10px" v-model="translateDelay">
      <option :value="1000">
        <code>1s</code>
      </option>
      <option :value="1500">
        <code>1.5s</code>
      </option>
      <option :value="2000">
        <code>2s</code>
      </option>
    </select>
    <input
      style="margin-left: 10px"
      v-model="saveFileName"
      placeholder="保存文件名"
    />
    <div style="flex: 1"></div>
    <div class="percent">{{ showPercentText }}</div>
  </header>
  <main>
    <div v-for="(keyObj, kIdx) in keyList" :key="kIdx" class="key-map">
      <pre :data-key="keyObj.key">
        <code class="key">"{{ keyObj.key }}":&nbsp;</code>
      </pre>
      <span class="value">{{ keyObj.locales }}</span>
    </div>
  </main>
</template>

<style scoped lang="scss">
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: white;
  display: flex;
  align-items: center;

  .logo-tip {
    position: relative;
    display: flex;
    align-items: center;

    &:hover {
      .tip-hover {
        display: block;
      }
    }

    .tip-hover {
      display: none;
      position: absolute;
      top: 75px;
      left: 20px;
      padding: 5px;
      box-shadow: 0 0 1px 2px #d6d6d6;
      border-radius: 2px;
      background: white;
      z-index: 2;
    }
  }

  .logo {
    height: 2em;
    padding: 1.5em;
    will-change: filter;
  }

  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }

  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  }

  .preview-file {
    width: 0;
  }

  .percent {
    padding-right: 10px;
  }
}

main {
  margin-top: 85px;

  .key-map {
    text-align: left;
    display: flex;
    align-items: center;

    pre {
      margin: 0;
      display: inline;
      white-space: normal;
    }

    .key {
      font-weight: bold;
      color: #42b883;
    }
    .value {
      color: #646cff;
    }
  }
}
</style>
