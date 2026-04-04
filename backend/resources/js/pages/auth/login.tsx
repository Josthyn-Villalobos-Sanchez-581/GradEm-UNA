import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import registro from '@/routes/registro';
import recuperar from '@/routes/recuperar';
import { Form, Head, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const useRedirectParam = () => {
    const page = usePage();
    const url = typeof page.url === "string" ? page.url : "";
    return new URL(url, window.location.origin).searchParams.get('redirect');
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {

    const redirect = useRedirectParam();

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">

            <Head title="Log in" />

            <Form
                action="/login"
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >

                {({ processing, errors }) => (

                    <>
                        <input type="hidden" name="redirect" value={redirect ?? ""} />

                        <div className="grid gap-6">

                            <div className="grid gap-2">
                                <Label htmlFor="correo">Email address</Label>

                                <Input
                                    id="correo"
                                    type="email"
                                    name="correo"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />

                                <InputError message={errors.correo} />
                            </div>

                            <div className="grid gap-2">

                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>

                                    {canResetPassword && (
                                        <TextLink
                                            href="/recuperar"
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}

                                </div>

                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />

                                <InputError message={errors.password} />

                            </div>

                            <div className="flex items-center space-x-3">

                                <Checkbox id="remember" name="remember" tabIndex={3} />

                                <Label htmlFor="remember">Remember me</Label>

                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                            >

                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}

                                Log in

                            </Button>

                        </div>

                        <div className="text-center text-sm text-muted-foreground">

                            Don't have an account?{" "}

                            <TextLink
                                href={
                                redirect
                                ? `/registro?redirect=${encodeURIComponent(redirect)}`
                                : "/registro"
                                }
                                tabIndex={5}
                            >
                                Sign up
                            </TextLink>

                        </div>

                    </>
                )}

            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

        </AuthLayout>
    );
}