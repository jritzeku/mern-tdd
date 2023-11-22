import { Component } from 'react'
import Input from '../components/Input'
import { withTranslation } from 'react-i18next'
import { signUp } from '../api/apiCalls'
import Alert from '../components/Alert'
import ButtonWithProgress from '../components/ButtonWithProgress'
import { Link } from 'react-router-dom'

class SignUpPage extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordRepeat: '',
    apiProgress: false,
    signUpSuccess: false,
    errors: {},
  }

  onChange = (event) => {
    const { id, value } = event.target
    const errorsCopy = { ...this.state.errors }
    delete errorsCopy[id]
    this.setState({
      [id]: value,
      errors: errorsCopy,
    })
  }

  submit = async (event) => {
    event.preventDefault()
    const { username, email, password } = this.state
    const body = {
      username,
      email,
      password,
    }
    this.setState({ apiProgress: true })

    try {
      let data = await signUp(body)
      //console.log('data:', data)
      this.setState({ signUpSuccess: true })
    } catch (error) {
      if (error.response.status === 400) {
        this.setState({ errors: error.response.data.validationErrors })
      }
      this.setState({ apiProgress: false })
    }
  }

  render() {
    const { t } = this.props
    let disabled = true
    const { password, passwordRepeat, apiProgress, signUpSuccess, errors } =
      this.state
    if (password && passwordRepeat) {
      disabled = password !== passwordRepeat
    }

    let passwordMismatch =
      password !== passwordRepeat ? t('passwordMismatchValidation') : ''

    return (
      <div
        className='col-lg-6 offset-lg-3 col-md-8 offset-md-2'
        data-testid='signup-page'
      >
        {!signUpSuccess && (
          <form className='card' data-testid='form-sign-up'>
            <div className='card-header'>
              <h1 className='text-center'>Sign Up</h1>
            </div>
            <div className='card-body'>
              <Input
                id='username'
                label='Username'
                onChange={this.onChange}
                help={errors.username}
              />
              <Input
                id='email'
                // label={t('email')}
                label='E-mail'
                onChange={this.onChange}
                help={errors.email}
              />
              <Input
                id='password'
                // label={t('password')}
                label='Password'
                onChange={this.onChange}
                help={errors.password}
                type='password'
              />
              <Input
                id='passwordRepeat'
                // label={t('passwordRepeat')}
                label='Password Repeat'
                onChange={this.onChange}
                help={passwordMismatch}
                type='password'
              />
              <div className='text-center'>
                <ButtonWithProgress
                  disabled={disabled}
                  apiProgress={apiProgress}
                  onClick={this.submit}
                >
                  {/* {t('signUp')} */}
                  Sign Up
                </ButtonWithProgress>
              </div>
            </div>
          </form>
        )}
        {signUpSuccess && (
          <Link to='/login'>Sign up successful! Log in to your account</Link>
        )}
      </div>
    )
  }
}

const SignUpPageWithTranslation = withTranslation()(SignUpPage)

export default SignUpPageWithTranslation
