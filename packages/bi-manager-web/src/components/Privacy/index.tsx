import { Button, Checkbox, Modal } from 'antd';
import styles from './index.less';
import { useState } from 'react';

interface Props {
  onChange: (value: boolean) => void;
}

export default function Privacy(props: Props) {
  const { onChange } = props;
  const [showModal, setShowModal] = useState(false);
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   setLoading(true);
  //   queryCurrentPrivacy().then((res) => {
  //     setLoading(false);
  //     const { success, result } = res;
  //     if (success) {
  //       setValue(result.agree);
  //     }
  //   });
  // }, []);

  return (
    <>
      <Checkbox onChange={(e) => onChange(e.target.checked)}>
        <span>同意</span>
        <Button
          size="small"
          type="link"
          onClick={() => {
            setShowModal(true);
          }}
        >
          《隐私协议》
        </Button>
      </Checkbox>
      <Modal
        title={'隐私协议'}
        width={800}
        maskClosable={true}
        onCancel={() => {
          setShowModal(false);
        }}
        visible={showModal}
        footer={false}
      >
        <div className={styles.content__body}>
          <h2>隐私授权声明</h2>
          <p>
            感谢您选择使用我们的服务！我们重视您的隐私权并致力于保护您的个人信息。为了您更好地了解我们如何收集、使用和保护您的个人信息，请阅读以下隐私授权声明。
          </p>

          <h3>收集的信息：</h3>
          <p>
            在注册新用户时，我们仅收集您的邮箱地址。这是为了创建您的账户，并确保我们可以与您进行沟通，以便向您提供更好的服务。
          </p>

          <h3>信息的使用：</h3>
          <p>您提供的邮箱地址将仅用于以下目的：</p>
          <ol>
            <li>创建和管理您的账户。</li>
            <li>向您发送与服务相关的通知，例如账户确认邮件、密码重置邮件等。</li>
            <li>在必要时联系您，以解决与您的账户相关的问题或提供支持。</li>
          </ol>

          <h3>信息的保护：</h3>
          <p>
            我们采取一系列安全措施来保护您提供的个人信息免受未经授权的访问、使用或泄露。我们采用行业标准的安全技术和程序来保护您的信息，并定期审查和更新我们的安全措施，以确保您的信息得到妥善保护。
          </p>

          <h3>变更通知：</h3>
          <p>
            我们保留随时更新此隐私授权声明的权利。如果我们对隐私授权声明进行重大变更，我们将在本页面上发布更新版本，并在必要时向您发送通知，以便您了解我们如何收集、使用和保护您的个人信息。
          </p>

          <p>
            请在使用我们的服务之前仔细阅读本隐私授权声明。您继续使用我们的服务将被视为您已阅读、理解并同意本隐私授权声明中的所有条款和条件。
          </p>

          <p>
            上述隐私授权声明旨在简明扼要地说明我们如何处理您的个人信息，如果您有任何疑问或需要进一步了解，请随时联系我们。
          </p>
          {/* <div className={styles.content__commit}>
        <Radio.Group
          onChange={(e) => {
            setValue(e.target.value);
          }}
          value={value}
        >
          <Radio value={'1'}>同意</Radio>
          <Radio value={'0'}>不同意</Radio>
        </Radio.Group>
        <Button
          loading={loading}
          onClick={() => {
            setLoading(true);
            updateCurrentPrivacy({ agree: value }).then((res) => {
              setLoading(false);
              if (res.success) {
                message.info('保存成功');
              } else {
                message.error('保存失败');
              }
            });
          }}
          type="primary"
        >
          保存
        </Button>
      </div> */}
        </div>
      </Modal>
    </>
  );
}
