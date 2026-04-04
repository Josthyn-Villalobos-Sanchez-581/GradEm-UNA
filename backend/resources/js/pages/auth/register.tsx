import registro from '@/routes/registro';
import { login } from '@/routes';
import { Form, Head, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

const useRedirectParam = () => {
    const { url } = usePage();
    return new URL(url, window.location.origin).searchParams.get('redirect');
};

export default function Register() {

    const redirect = useRedirectParam();

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >

            <Head title="Register" />

            <Form
                action="/registro" method="post"
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >

                {({ processing, errors }) => (

                    <>
                        <input type="hidden" name="redirect" value={redirect ?? ""} />

                        <div className="grid gap-6">

                            <div className="grid gap-2">

                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />

                                <InputError message={errors.name} />

                            </div>

                            <div className="grid gap-2">

                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />

                                <InputError message={errors.email} />

                            </div>

                            <div className="grid gap-2">

                                <Label htmlFor="password">Password</Label>

                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />

                                <InputError message={errors.password} />

                            </div>

                            <div className="grid gap-2">

                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>

                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />

                                <InputError message={errors.password_confirmation} />

                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                            >

                                {processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}

                                Create account

                            </Button>

                        </div>

                        <div className="text-center text-sm text-muted-foreground">

                            Already have an account?{" "}

                            <TextLink
                                href={
                                    redirect
                                        ? `/login?redirect=${encodeURIComponent(redirect)}`
                                        : "/login"
                                }
                                tabIndex={6}
                            >
                                Log in
                            </TextLink>

                        </div>

                    </>
                )}

            </Form>

        </AuthLayout>
    );
}